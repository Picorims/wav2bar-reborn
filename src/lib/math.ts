/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

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
		throw new Error('step cannot be 0');
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
		throw new Error('d cannot be 0');
	}
	return (n / d) * 100;
}
export function ratio(n: number, d: number): [number, number] {
	if (d === 0) {
		throw new Error('d cannot be 0');
	}
	return [n, d];
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Immutable 2D vector class (always return new instances on operations)
 */
export class Vec2 {
	// eslint-disable-next-line no-underscore-dangle
	private _x: number;
	// eslint-disable-next-line no-underscore-dangle
	private _y: number;
	get x(): number {
		return this._x;
	}
	get y(): number {
		return this._y;
	}
	constructor(x: number, y: number) {
		this._x = x;
		this._y = y;
	}
	add(other: Vec2): Vec2 {
		return new Vec2(this.x + other.x, this.y + other.y);
	}
	sub(other: Vec2): Vec2 {
		return new Vec2(this.x - other.x, this.y - other.y);
	}
	negate(): Vec2 {
		return new Vec2(-this.x, -this.y);
	}
	scale(factor: number): Vec2 {
		return new Vec2(this.x * factor, this.y * factor);
	}
	get length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	normalize(): Vec2 {
		const len = this.length;
		if (len === 0) {
			return new Vec2(0, 0);
		}
		return new Vec2(this.x / len, this.y / len);
	}
	dot(other: Vec2): number {
		return this.x * other.x + this.y * other.y;
	}
}

export function toU16ArrayBigEndian(buffer: ArrayBuffer) {
	const view = new DataView(buffer);
	const cacheBuffer = new ArrayBuffer(buffer.byteLength);
	const uint16Array = new Uint16Array(
		cacheBuffer,
		0,
		buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT
	);

	for (let i = 0; i < uint16Array.length; i++) {
		uint16Array[i] = view.getUint16(2 * i, false);
	}

	return uint16Array;
}
