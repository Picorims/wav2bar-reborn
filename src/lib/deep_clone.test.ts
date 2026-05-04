/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { describe, it, expect } from 'vitest';
import { deepClone } from './deep_clone';
import type { JsonLike } from './types/common_types';

describe('deep_clone', () => {
	describe('deepClone', () => {
		it('clones simple values', () => {
			const tests: JsonLike[] = [null, 5, 8.9, 'string stuff', true, false, [], {}];
			for (const test of tests) {
				expect(deepClone(test)).to.deep.equal(test);
			}
		});

		it('clones complex values', () => {
			const tests: JsonLike[] = [
				{
					a: 5,
					b: {
						c: 4,
						foo: {
							bar: 'different',
							key: null
						},
						d: 'wow'
					}
				},
				[
					8984,
					'foo',
					'bar',
					[
						5,
						null,
						'stuff',
						{
							some: 'kind',
							of: 'obj',
							its: true,
							arr: [],
							obj: {}
						}
					],
					{
						object: 'here',
						key: null
					}
				],
				{
					8984: 45,
					foo: 'bar',
					baz: [
						5,
						null,
						'stuff',
						{
							some: 'kind',
							of: 'obj',
							its: true
						}
					],
					someother: {
						object: 'here'
					}
				}
			];
			for (const test of tests) {
				expect(deepClone(test)).to.deep.equal(test);
			}
		});
	});
});
