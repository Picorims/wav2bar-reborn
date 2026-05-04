/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { describe, expect, it } from 'vitest';
import { clamp, Vec2 } from './math';

describe('math', () => {
	describe('clamp', () => {
		it('clamps value within min and max', () => {
			expect(clamp(5, 1, 10)).toBe(5); // within range
			expect(clamp(-5, 1, 10)).toBe(1); // below min
			expect(clamp(15, 1, 10)).toBe(10); // above max
			expect(clamp(1, 1, 10)).toBe(1); // equal to min
			expect(clamp(10, 1, 10)).toBe(10); // equal to max
		});
	});
	describe('Vec2', () => {
		it('creates a Vec2 instance', () => {
			const vec = new Vec2(3, 4);
			expect(vec.x).toBe(3);
			expect(vec.y).toBe(4);
		});

		it('adds two Vec2 instances', () => {
			const vec1 = new Vec2(1, 2);
			const vec2 = new Vec2(3, 4);
			const result = vec1.add(vec2);
			expect(result.x).toBe(4);
			expect(result.y).toBe(6);
		});

		it('subtracts two Vec2 instances', () => {
			const vec1 = new Vec2(5, 7);
			const vec2 = new Vec2(2, 3);
			const result = vec1.sub(vec2);
			expect(result.x).toBe(3);
			expect(result.y).toBe(4);
		});

		it('scales a Vec2 instance', () => {
			const vec = new Vec2(2, 3);
			const result = vec.scale(2);
			expect(result.x).toBe(4);
			expect(result.y).toBe(6);
		});

		it('provides the length of the vector', () => {
			const vec = new Vec2(3, 4);
			expect(vec.length).toBe(5);
		});

		it('normalizes the vector', () => {
			const vec = new Vec2(3, 4);
			const normalized = vec.normalize();
			expect(normalized.length).toBeCloseTo(1);
			expect(normalized.x).toBeCloseTo(0.6);
			expect(normalized.y).toBeCloseTo(0.8);
		});

		it('handles zero-length vector normalization', () => {
			const vec = new Vec2(0, 0);
			const normalized = vec.normalize();
			expect(normalized.x).toBe(0);
			expect(normalized.y).toBe(0);
		});

		it('negates the vector', () => {
			const vec = new Vec2(3, -4);
			const negated = vec.negate();
			expect(negated.x).toBe(-3);
			expect(negated.y).toBe(4);
		});

		it('computes dot product', () => {
			const vec1 = new Vec2(1, 2);
			const vec2 = new Vec2(3, 4);
			const dotProduct = vec1.dot(vec2);
			expect(dotProduct).toBe(11); // 1*3 + 2*4 = 3 + 8 = 11
		});

		it('is immutable', () => {
			const vec1 = new Vec2(1, 2);
			const vec2 = new Vec2(3, 4);
			const vec3 = vec1.add(new Vec2(3, 4));
			expect(vec1.x).toBe(1);
			expect(vec1.y).toBe(2);
			expect(vec2.x).toBe(3);
			expect(vec2.y).toBe(4);
			expect(vec3.x).toBe(4);
			expect(vec3.y).toBe(6);
		});
	});
});
