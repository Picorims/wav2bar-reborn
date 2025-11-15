/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

/**
 * 
 * @param value value to floor 
 * @param step "precision", i.e floor(7) with step 5 will return 5.
 * @param offset shift the step points
 * @returns 
 */
export function floor(value: number, step = 1, offset = 0) {
    if (step === 0) {
        throw new Error("step cannot be 0");
    }
    /* TODO: test */
    // based on https://stackoverflow.com/questions/14627566/rounding-in-steps-of-20-or-x-in-javascript
    return Math.floor((value - offset) / step) * step + offset;
}

export function maxPercentFrom(percent: number, ratio: [number, number]): number {
    return Math.max(percent, ratioToPercent(ratio[0], ratio[1]));
}
export function minPercentFrom(percent: number, ratio: [number, number]): number {
    return Math.min(percent, ratioToPercent(ratio[0], ratio[1]));
}
export function ratioToPercent(n: number, d: number): number {
    if (d === 0) {
        throw new Error("d cannot be 0");
    }
    return (n/d) * 100;
}
export function ratio(n: number, d: number): [number, number] {
    if (d === 0) {
        throw new Error("d cannot be 0");
    }
    return [n, d];
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}