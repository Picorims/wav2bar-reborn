/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from '$lib/engine/audio/audio_provider';
import type { SupportsVisualizerProps } from '$lib/types/schemas/save_v4';
import { TickUnit } from './tick_unit';

type SpectrumData = [Uint8Array, Uint16Array]; // [spectrum, frequencies]

interface Mapping {
    toLog: boolean;
    mappedLength: number;
    minPercent: number;
    maxPercent: number;
}

interface SpectrumSmoothingParams {
    type: SupportsVisualizerProps["visualization_smoothing_type"];
    factor: number;
}

interface EaseFunctionParams {
    /**
     * Must be positive
     */
    prev: number;
    /**
     * Must be positive
     */
    curr: number;
    maxT: number;
    factor: number;
}

const easeFunction: Record<SupportsVisualizerProps["visualization_smoothing_type"], (params: EaseFunctionParams) => number> = {
    "linear_decrease": ({prev, curr, factor, maxT}) => {
        //The new value can't decrease more than the factor value between current[i] and previous[i].
        //The decrease is linear as long as the new value is below the old value minus the factor.
        //This factor defines how quick the decay is.

        //factor = 0 prevents from decreasing. factor > (maximum possible value for current[i]) disables the smoothing.
        const scaledSmoothFactor = factor * maxT; //0 to 1 -> 0 to max array value (255 with Int8Array)
        const maxDecayLimit = prev - scaledSmoothFactor;
        if (curr < maxDecayLimit ) {
            return maxDecayLimit;
        }
        return curr;
    },
    "proportional_decrease": ({prev, curr, factor}) => {
        //The new value can't decrease more than the previous[i]*factor.
        //The higher current[i] is, the more impacted it is, making low smoothing for high values,
        //but high smoothing for low values.
        //The decrease is proportional as long as the new value is below the old value multiplicated by the factor.

        //factor = 1 prevents from decreasing. factor > 1 indefinitely increase quicker and quicker previous[i].
        //factor = 0 disables the smoothing
        const maxProportionalDecayLimit = prev * factor;
        if (curr < maxProportionalDecayLimit) {
            return maxProportionalDecayLimit;
        }
        return curr;
    },
    "average": ({prev, curr, factor}) => {
        //This is very similar to the smoothing system used by the Web Audio API.
        //The formula is the following (|x|: absolute value of x):
        //new[i] = factor * previous[i] + (1-factor) * |current[i]|

        //factor = 0 disables the smoothing. factor = 1 freezes everything and keep previous[i] forever.
        //factor not belonging to [0,1] creates uncontrolled behaviour.
        return factor * prev + (1 - factor) * Math.abs(curr);
    }
}

export class AudioSpectrumProcessor extends TickUnit<SpectrumData> {
    private static _DEFAULT_VALUE: SpectrumData = [new Uint8Array(0), new Uint16Array(0)];
    private _mapping: Mapping = {
        /**
         * If true, the spectrum will be converted to a logarithmic scale.
         * This is independent from mapping.
         */
        toLog: true,
        /**
         * use a value below or equal to 0 to disable mapping.
         * This is independent from log scale remapping.
         */
        mappedLength: 1024,
        minPercent: 0,
        maxPercent: 100
    }
    private _previousSpectrum: Uint8Array = new Uint8Array(0);
    private _spectrumSmoothingParams: SpectrumSmoothingParams = {
        type: "average",
        factor: 0.8
    };

    constructor() {
        super(AudioSpectrumProcessor._DEFAULT_VALUE);
    }

    setMapping(mapping: Partial<Mapping>) {
        this._mapping = {
            ...this._mapping,
            ...mapping
        };
    }
    setSmoothingParams(params: Partial<SpectrumSmoothingParams>) {
        this._spectrumSmoothingParams = {
            ...this._spectrumSmoothingParams,
            ...params
        };
    }

    getDefaultValue(): SpectrumData {
        return AudioSpectrumProcessor._DEFAULT_VALUE;
    }

    protected computeNewState(
        _basis: SpectrumData,
        audioProvider: AudioProvider | null
    ): SpectrumData {
        if (!audioProvider) {
            return this.getDefaultValue();
        }
        let spectrum = audioProvider.getCurrentAudioSpectrum();
        const frequencies = audioProvider.getFrequencies();
        if (this._mapping.toLog) {
            spectrum = this.toLogSpectrum(spectrum, frequencies);
        }
        if (this._mapping.mappedLength > 0) {
            spectrum = this.mappedArray(
                spectrum,
                this._mapping.mappedLength,
                Math.floor(this._mapping.minPercent * spectrum.length / 100),
                Math.ceil(this._mapping.maxPercent * spectrum.length / 100)
            );
        }

        this._easeSpectrum(spectrum);

        this._previousSpectrum = spectrum;
        return [spectrum, frequencies];
    }

    /**
     * @see https://youtu.be/BFld4EBO2RE?si=Qm3NV0ZGHhXkPF7d&t=203
     * @param from
     * @param to
     * @param ratio
     * @returns
     */
    private smoothStep(from: number, to: number, ratio: number) {
        const smoothedRatio = 3 * ratio * ratio - 2 * ratio * ratio * ratio;
        return from + (to - from) * smoothedRatio;
    }

    /**
     *
     * @param spectrum linear raw spectrum from FFT output
     * @param frequencies associated frequencies (must be of the same length!).
     * Assuming it is sorted with the highest frequency at the end.
     * @returns the logarithmic scaled spectrum with smoothstep interpolation where needed
     */
    toLogSpectrum(spectrum: Uint8Array, frequencies: Uint16Array): Uint8Array {
        if (spectrum.length !== frequencies.length) {
            throw new Error(
                `Spectrum (${spectrum.length}) and frequencies (${frequencies.length}) length mismatch`
            );
        }
        const logSpectrum = new Uint8Array(spectrum.length);
        /**
         * index -> list of values for this frequency index
         */
        const dataMap: Map<number, number[]> = new Map();
        //max index possible returned from the log should be closest to last index available.
        // We search k where log2(max_frequency) * k = frequencies.length -1
        const RANGE = [20, 20_000]; // Hz
        const scaleFactor = frequencies.length / Math.log2(RANGE[1] - RANGE[0]);
        for (let i = 0; i < spectrum.length; i++) {
            // log do the mapping, * scale factor increases the resolution.
            // (log2 of 20_000 is index 14 approx, while we have
            // hundreds or thousands of indexes available)
            // we offset by RANGE[0] to avoid having very low frequencies taking a lot of space
            const freq = Math.max(RANGE[0] + 1, frequencies[i]); // +1 to avoid log2(x < 1)
            const logIndex = Math.floor(Math.log2(freq - RANGE[0]) * scaleFactor);
            if (!dataMap.has(logIndex)) {
                dataMap.set(logIndex, []);
            }
            dataMap.get(logIndex)?.push(spectrum[i]);
        }

        const fillInterpolated = (fromIndex: number, toIndex: number) => {
            const fromValue = logSpectrum[fromIndex];
            const toValue = logSpectrum[toIndex];
            for (let j = 1; j <= consecutiveEmptyCount; j++) {
                // why +1: the step is the gap, there are consecutiveEmptyCount + 1 steps between from and to
                const interpolated = this.smoothStep(fromValue, toValue, j / (consecutiveEmptyCount + 1));
                logSpectrum[fromIndex + j] = Math.round(interpolated);
            }
        };

        //compute the array
        let consecutiveEmptyCount = 0;
        for (let i = 0; i < logSpectrum.length; i++) {
            if (dataMap.has(i)) {
                const values = dataMap.get(i)!;
                const sum = values.reduce((a, b) => a + b, 0);
                logSpectrum[i] = Math.round(sum / values.length);

                // interpolate empty values in between
                if (consecutiveEmptyCount > 0) {
                    let fromIndex = i - consecutiveEmptyCount - 1;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                    fillInterpolated(fromIndex, i);
                }

                consecutiveEmptyCount = 0;
            } else {
                consecutiveEmptyCount++;
            }
        }

        if (consecutiveEmptyCount > 0) {
            // fill the end with the last known value
            let fromIndex = logSpectrum.length - 1 - consecutiveEmptyCount - 1;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
            fillInterpolated(fromIndex, logSpectrum.length - 1);
        }

        return logSpectrum;
    }

    /**
     * function that remaps an array, within the given min and max, to a new length.
     *
     * @export
     * @param array
     * @param new_length
     * @param min minimum index to consider for mapping.
     * @param max maximum index to consider for mapping.
     * It is NOT guaranteed that max will be included in the output array.
     * @return The mapped array.
     */
    mappedArray(array: Uint8Array, new_length: number, min: number = 0, max: number = array.length-1): Uint8Array {
        if (new_length < 0) {
            throw new Error("new_length must be non-negative.");
        }
        if (array.length === 0 && new_length === 0) {
            return new Uint8Array([]);
        }
        if (array.length === 0 && new_length > 0) {
            throw new Error("Cannot map from an empty array to a non-empty array.");
        }
        if (min < 0) {
            throw new Error("min index cannot be negative.");
        }
        if (max >= array.length) {
            throw new Error("max index cannot be greater than or equal to array length.");
        }
        if (new_length === 0) {
            return new Uint8Array([]);
        }
        
        const newArray = new Uint8Array(new_length);
        const step = (max - min + 1) / (new_length); // (range length) / new length.

        let increment = min; //we start a the minimum of the range

        //We want to take at equal distance a "new_length" number of values in the old array, from min to max.
        //In order to know how much we need to increment, we create a step.
        //If the range length is inferior than the new length, step < 1 since we have to get some values multiple times
        //to match the new length.
        //If the range length is superior than the new length, step > 1 since we have to skip some values to match the new length.

        //ARRAY CREATION
        for (let i = 0; i < new_length; i++) {
            newArray[i] = (array[Math.floor(increment)]);
            increment += step;
        }

        //RETURN THE NEW ARRAY TO THE CALL
        return newArray;
    }

    private _easeSpectrum(spectrum: Uint8Array): void {
        for (let i = 0; i < spectrum.length; i++) {
            const prev = this._previousSpectrum[i] || 0;
            const curr = spectrum[i];
            spectrum[i] = easeFunction[this._spectrumSmoothingParams.type]({
                prev,
                curr,
                maxT: 255,
                factor: this._spectrumSmoothingParams.factor
            });
        }
    }
}
