/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from "$lib/engine/audio/audio_provider";
import { TickUnit } from "./tick_unit";

type SpectrumData = [Uint8Array, Uint16Array]; // [spectrum, frequencies]
export class AudioSpectrumProcessor extends TickUnit<SpectrumData> {
    private static _DEFAULT_VALUE: SpectrumData = [new Uint8Array(0), new Uint16Array(0)];

    constructor() {
        super(AudioSpectrumProcessor._DEFAULT_VALUE);
    }

    getDefaultValue(): SpectrumData {
        return AudioSpectrumProcessor._DEFAULT_VALUE;
    }

    protected computeNewState(_basis: SpectrumData, audioProvider: AudioProvider | null): SpectrumData {
        if (!audioProvider) {
            return this.getDefaultValue();
        }

        return [audioProvider.getCurrentAudioSpectrum(), audioProvider.getFrequencies()];
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
            throw new Error(`Spectrum (${spectrum.length}) and frequencies (${frequencies.length}) length mismatch`);
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
            const freq = Math.max(RANGE[0] + 1, frequencies[i]);  // +1 to avoid log2(x < 1)
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
        }

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
            let fromIndex = (logSpectrum.length - 1) - consecutiveEmptyCount - 1;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
            fillInterpolated(fromIndex, logSpectrum.length - 1);
        }
        
        return logSpectrum;
    }
}