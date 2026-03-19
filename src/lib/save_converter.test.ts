/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { describe, expect, it } from 'vitest';
import {
	convertRGBAToHexV4,
	parseCSSBorderRadiusV4,
	parseCSSBoxShadowV4,
	parseCSSGradientV4
} from './save_converter';
import type { Shape as ShapeV5 } from './types/schemas/save_v5';

describe('save_converter', () => {
	describe('convertRGBAToHexV4', () => {
		const tests: [string, string, string][] = [
			['fully opaque', 'rgba(255, 0, 0, 1)', '#ff0000'],
			['fully transparent', 'rgba(255, 0, 0, 0)', '#ff000000'],
			['semi-transparent', 'rgba(255, 0, 0, 0.5)', '#ff000080'],
			['with spaces', 'rgba( 255 , 0 , 0 , 0.5 )', '#ff000080'],
			['without rgba', 'rgb(255, 0, 0)', '#ff0000'],
			['no spaces', 'rgba(255,0,0,0.5)', '#ff000080']
		];

		tests.forEach(([description, input, expected]) => {
			it(`handles: ${description}`, () => {
				const result = convertRGBAToHexV4(input, []);
				expect(result).toBe(expected);
			});
		});
	});
	describe('parseCSSBorderRadiusV4', () => {
		// https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-radius
		const tests: [string, string, ShapeV5['border_radius']][] = [
			[
				'one px value',
				'10px',
				[
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 }
				]
			],
			[
				'two % values',
				'10% 20%',
				[
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 20 }
				]
			],
			[
				'four percent values',
				'10% 20% 30% 40%',
				[
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 30 },
					{ unit: 'percent', value: 30 },
					{ unit: 'percent', value: 40 },
					{ unit: 'percent', value: 40 }
				]
			],
			[
				'horizontal and vertical percent values',
				'10% / 20%',
				[
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 20 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 10 },
					{ unit: 'percent', value: 20 }
				]
			],
			[
				'two horizontal px and one vertical px values',
				'10px 20px / 30px',
				[
					{ unit: 'px', value: 30 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 20 },
					{ unit: 'px', value: 30 },
					{ unit: 'px', value: 30 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 20 },
					{ unit: 'px', value: 30 }
				]
			],
			[
				'three pixel values with one zero value',
				'10px 0 20px',
				[
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 10 },
					{ unit: 'px', value: 0 },
					{ unit: 'px', value: 0 },
					{ unit: 'px', value: 20 },
					{ unit: 'px', value: 20 },
					{ unit: 'px', value: 0 },
					{ unit: 'px', value: 0 }
				]
			]
		];

		tests.forEach(([description, input, expected]) => {
			it(`handles: ${description}`, () => {
				const result = parseCSSBorderRadiusV4(input);
				expect(result.border_radius).toEqual(expected);
			});
		});
	});
	describe('parseCSSBoxShadowV4', () => {
		// https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow
		const tests: [string, string, ShapeV5['box_shadows']][] = [
			[
				'x, y, offset, color',
				'10px 5px 5px red',
				[
					{
						offset: { x: 10, y: 5 },
						blur_radius: 5,
						spread_radius: 0,
						color: 'red',
						inset: false
					}
				]
			],
			[
				'x, negative y, color',
				'60px -15px teal',
				[
					{
						offset: { x: 60, y: -15 },
						blur_radius: 0,
						spread_radius: 0,
						color: 'teal',
						inset: false
					}
				]
			],
			[
				'x, y, blur, spread, color',
				'12px 12px 2px 1px rgba(0, 0, 255, 0.5)',
				[
					{
						offset: { x: 12, y: 12 },
						blur_radius: 2,
						spread_radius: 1,
						color: '#0000ff80',
						inset: false
					}
				]
			],
			[
				'inset, x, y, blur, color',
				'inset 5px 5px 10px #000000',
				[
					{
						offset: { x: 5, y: 5 },
						blur_radius: 10,
						spread_radius: 0,
						color: '#000000',
						inset: true
					}
				]
			],
			[
				'multiple shadows',
				'10px 5px 5px red, inset 0 0 10px #000000',
				[
					{
						offset: { x: 10, y: 5 },
						blur_radius: 5,
						spread_radius: 0,
						color: 'red',
						inset: false
					},
					{
						offset: { x: 0, y: 0 },
						blur_radius: 10,
						spread_radius: 0,
						color: '#000000',
						inset: true
					}
				]
			]
		];

		tests.forEach(([description, input, expected]) => {
			it(`handles: ${description}`, () => {
				const result = parseCSSBoxShadowV4(input);
				expect(result.box_shadows).toEqual(expected);
			});
		});
	});
	describe('parseCSSGradientV4', () => {
		const tests: [string, string, ShapeV5['background']['last_gradient'] | null][] = [
			[
				'linear gradient with angle and three color stops',
				'linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)',
				{
					type: 'linear',
					start_point: { x: 0, y: 0.5 },
					end_point: { x: 1, y: 0.5 },
					color_stops: [
						{ offset: 0, color: '#2a7b9b' },
						{ offset: 0.5, color: '#57c785' },
						{ offset: 1, color: '#eddd53' }
					]
				}
			],
			[
				'radial gradient and two color stops',
				'radial-gradient(rgba(63, 94, 251, 1) 0%, rgba(252, 70, 107, 1) 100%)',
				{
					type: 'radial',
					color_stops: [
						{ offset: 0, color: '#3f5efb' },
						{ offset: 1, color: '#fc466b' }
					]
				}
			]
		];

		tests.forEach(([description, input, expected]) => {
			it(`handles: ${description}`, () => {
				const result = parseCSSGradientV4(input);
				expect(result.gradient).toEqual(expected);
			});
		});
	});
});
