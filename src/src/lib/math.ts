/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (C) 2024  Picorims <picorims.contact@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * 
 * @param value value to floor 
 * @param step "precision", i.e floor(7) with step 5 will return 5.
 * @param offset shift the step points
 * @returns 
 */
export function floor(value: number, step = 1, offset = 0) {
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
    return (n/d) * 100;
}
export function ratio(n: number, d: number): [number, number] {
    return [n, d];
}
