/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from '$lib/engine/audio/audio_provider';
import type { SupportsVisualizerProps } from '$lib/types/schemas/save_v4';
import { TickUnit } from './tick_unit';

type SpectrumData = [Uint16Array, Uint16Array]; // [spectrum, frequencies]

interface Mapping {
	toLog: boolean;
	mappedLength: number;
	minPercent: number;
	maxPercent: number;
}

interface SpectrumSmoothingParams {
	type: SupportsVisualizerProps['visualization_smoothing_type'];
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

const easeFunction: Record<
	SupportsVisualizerProps['visualization_smoothing_type'],
	(params: EaseFunctionParams) => number
> = {
	linear_decrease: ({ prev, curr, factor, maxT }) => {
		//The new value can't decrease more than the factor value between current[i] and previous[i].
		//The decrease is linear as long as the new value is below the old value minus the factor.
		//This factor defines how quick the decay is.

		//factor = 0 prevents from decreasing. factor > (maximum possible value for current[i]) disables the smoothing.
		const scaledSmoothFactor = factor * maxT; //0 to 1 -> 0 to max array value (255 with Int8Array)
		const maxDecayLimit = prev - scaledSmoothFactor;
		if (curr < maxDecayLimit) {
			return maxDecayLimit;
		}
		return curr;
	},
	proportional_decrease: ({ prev, curr, factor }) => {
		//The new value can't decrease more than the previous[i]*factor.
		//The higher current[i] is, the more impacted it is, making low smoothing for high values,
		//but high smoothing for low values.
		//The decrease is proportional as long as the new value is below the old value multiplied by the factor.

		//factor = 1 prevents from decreasing. factor > 1 indefinitely increase quicker and quicker previous[i].
		//factor = 0 disables the smoothing
		const maxProportionalDecayLimit = prev * factor;
		if (curr < maxProportionalDecayLimit) {
			return maxProportionalDecayLimit;
		}
		return curr;
	},
	average: ({ prev, curr, factor }) => {
		//This is very similar to the smoothing system used by the Web Audio API.
		//The formula is the following (|x|: absolute value of x):
		//new[i] = factor * previous[i] + (1-factor) * |current[i]|

		//factor = 0 disables the smoothing. factor = 1 freezes everything and keep previous[i] forever.
		//factor not belonging to [0,1] creates uncontrolled behaviour.
		return factor * prev + (1 - factor) * Math.abs(curr);
	}
};

export class AudioSpectrumProcessor extends TickUnit<SpectrumData> {
	private static DEFAULT_VALUE: SpectrumData = [new Uint16Array(0), new Uint16Array(0)];
	private mapping: Mapping = {
		/**
		 * If true, the spectrum will be converted to a logarithmic scale.
		 * This is independent from mapping.
		 */
		toLog: true,
		/**
		 * use a value below or equal to 0 to disable mapping.
		 * This is independent from log scale remapping.
		 */
		mappedLength: 1024, //FIXME default may create an error?
		minPercent: 0,
		maxPercent: 100
	};
	private previousSpectrum: Uint16Array = new Uint16Array(0);
	private spectrumSmoothingParams: SpectrumSmoothingParams = {
		type: 'average',
		factor: 0.8
	};

	constructor() {
		super(AudioSpectrumProcessor.DEFAULT_VALUE);
	}

	setMapping(mapping: Partial<Mapping>) {
		this.mapping = {
			...this.mapping,
			...mapping
		};
	}
	setSmoothingParams(params: Partial<SpectrumSmoothingParams>) {
		this.spectrumSmoothingParams = {
			...this.spectrumSmoothingParams,
			...params
		};
	}

	getDefaultValue(): SpectrumData {
		return AudioSpectrumProcessor.DEFAULT_VALUE;
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
		if (this.mapping.toLog) {
			spectrum = this.toLog10Spectrum(spectrum, frequencies);
		}
		if (this.mapping.mappedLength > 0) {
			spectrum = this.mappedArray(
				spectrum,
				this.mapping.mappedLength,
				Math.floor(this.mapping.minPercent / 100 * spectrum.length),
				Math.ceil(this.mapping.maxPercent / 100 * spectrum.length)
			);
		}

		this.easeSpectrum(spectrum);

		this.previousSpectrum = spectrum;
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
	toLog10Spectrum(spectrum: Uint16Array, frequencies: Uint16Array): Uint16Array {
		if (spectrum.length !== frequencies.length) {
			throw new Error(
				`Spectrum (${spectrum.length}) and frequencies (${frequencies.length}) length mismatch`
			);
		}
		const logSpectrum = new Uint16Array(spectrum.length);
		/**
		 * index -> list of values for this frequency index
		 */
		const outIndexValues: Array<Array<number>> = [];
		for (let i = 0; i < spectrum.length; i++) {
			outIndexValues.push([]);
		}
		const RANGE_HZ = [20, 20_000]; // Hz
		const minPow10 = Math.log10(RANGE_HZ[0]);
		const maxPow10 = Math.log10(RANGE_HZ[1]);
		const pow10Range = maxPow10 - minPow10;
		const mappingRatio = spectrum.length / pow10Range
		for (let i = 0; i < spectrum.length; i++) {
			const iFreq = frequencies[i];
			if (iFreq < RANGE_HZ[0] || iFreq > RANGE_HZ[1]) {
				continue;
			}

			const pow10Curr = Math.log10(iFreq);
			const outIndex = Math.floor(mappingRatio * (pow10Curr - minPow10));
			outIndexValues[outIndex].push(spectrum[i]);
		}

		// console.log(spectrum, frequencies, outIndexValues);

		const fillInterpolated = (fromIndexExcluded: number, toIndexExcluded: number) => {
			const fromValue = logSpectrum[fromIndexExcluded];
			const toValue = logSpectrum[toIndexExcluded];
			const countToFill = toIndexExcluded - fromIndexExcluded - 1; // from value and to value are already set.
			const indexLength = toIndexExcluded - fromIndexExcluded;

			for (let j = 1; j <= countToFill; j++) {
				const interpolated = this.smoothStep(fromValue, toValue, j / indexLength);
				logSpectrum[fromIndexExcluded + j] = Math.round(interpolated);
			}
		};

		//compute the array
		let consecutiveEmptyCount = 0;
		for (let i = 0; i < logSpectrum.length; i++) {
			if (outIndexValues[i].length > 0) {
				const values = outIndexValues[i];
				const sum = values.reduce((a, b) => a + b, 0);
				logSpectrum[i] = Math.round(sum / values.length);

				// interpolate empty values in between
				if (consecutiveEmptyCount > 0) {
					let fromIndex = (i - 1) - consecutiveEmptyCount;
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
			let fromIndex = (logSpectrum.length - 2 /*-1 -1*/) - consecutiveEmptyCount;
			if (fromIndex < 0) {
				fromIndex = 0;
			}
			fillInterpolated(fromIndex, logSpectrum.length - 1);
		}

		return logSpectrum;
	}

	/**
	 * function that remaps an array, within the given min and max, to a new length,
	 * by picking `newLength` values in `array` at equal distances from provided min to max,
	 * or the whole array otherwise.
	 *
	 * @export
	 * @param array
	 * @param newLength
	 * @param minInOldArray minimum index to consider for mapping.
	 * @param maxInOldArray maximum index to consider for mapping.
	 * It is NOT guaranteed that the value at the maximum index
	 * will be included in the output array.
	 * @return The mapped array.
	 */
	mappedArray(
		array: Uint16Array,
		newLength: number,
		minInOldArray: number = 0,
		maxInOldArray: number = array.length - 1
	): Uint16Array {
		if (newLength < 0) {
			throw new Error('new_length must be non-negative.');
		}
		if (array.length === 0 && newLength === 0) {
			return new Uint16Array([]);
		}
		if (array.length === 0 && newLength > 0) {
			throw new Error('Cannot map from an empty array to a non-empty array.');
		}
		if (minInOldArray < 0) {
			throw new Error('min index cannot be negative.');
		}
		if (maxInOldArray >= array.length) {
			throw new Error('max index cannot be greater than or equal to array length.');
		}
		if (newLength === 0) {
			return new Uint16Array([]);
		}

		const newArray = new Uint16Array(newLength);
		const step = (maxInOldArray - minInOldArray + 1) / newLength; // (range length) / new length.

		let increment = minInOldArray; //we start a the minimum of the range

		//We want to take at equal distance a "new_length" number of values in the old array, from min to max.
		//In order to know how much we need to increment, we create a step.
		//If the range length is inferior than the new length, step < 1 since we have to get some values multiple times
		//to match the new length.
		//If the range length is superior than the new length, step > 1 since we have to skip some values to match the new length.

		//ARRAY CREATION
		for (let i = 0; i < newLength; i++) {
			newArray[i] = array[Math.floor(increment)];
			increment += step;
		}

		//RETURN THE NEW ARRAY TO THE CALL
		return newArray;
	}

	average(spectrum: Uint16Array): number {
		if (spectrum.length === 0) {
			return 0;
		}
		let sum = 0;
		for (let i = 0; i < spectrum.length; i++) {
			sum += spectrum[i];
		}
		return sum / spectrum.length;
	}

	private easeSpectrum(spectrum: Uint16Array): void {
		for (let i = 0; i < spectrum.length; i++) {
			const prev = this.previousSpectrum[i] || 0;
			const curr = spectrum[i];
			spectrum[i] = easeFunction[this.spectrumSmoothingParams.type]({
				prev,
				curr,
				maxT: 65_535,
				factor: this.spectrumSmoothingParams.factor
			});
		}
	}
}
