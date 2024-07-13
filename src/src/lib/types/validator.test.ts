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

import { describe, expect, it } from 'vitest';
import {
	arrayValidator,
	recordValidator,
	validateAgainstArray,
	validateAgainstRecord,
	validators,
	type ValidatorName,
	type ValidatorRecord
} from './validator';

describe('validator', () => {
	describe('atomic validators', () => {
		type Test = [unknown, boolean];

		const numberTests: Test[] = [
			[5, true],
			['5', false],
			[null, false],
			[undefined, false],
			[true, false],
			[{}, false],
			[() => {}, false],
			[NaN, false]
		];

		const stringTests: Test[] = [
			['string', true],
			[5, false],
			[null, false],
			[undefined, false],
			[true, false],
			[{}, false],
			[() => {}, false]
		];

		const objectTests: Test[] = [
			[{}, true],
			[new Object(), true],
			[{ a: 5 }, true],
			[undefined, false],
			[5, false],
			['object', false],
			[true, false],
			[() => {}, false],
			[[], true],
			// eslint-disable-next-line @typescript-eslint/no-array-constructor
			[new Array(), true],
			[new Uint8Array(), true]
		];

		const undefinedTests: Test[] = [
			[undefined, true],
			[null, false],
			[5, false],
			['undefined', false],
			[true, false],
			[{}, false],
			[() => {}, false],
			[Infinity, false],
			[-Infinity, false],
			[NaN, false]
		];

		const nullTests: Test[] = [
			[null, true],
			[undefined, false],
			[5, false],
			['null', false],
			[true, false],
			[{}, false],
			[() => {}, false],
			[Infinity, false],
			[-Infinity, false],
			[NaN, false]
		];

		const tests: Record<ValidatorName, Test[]> = {
			number: [
				...numberTests,
				[Math.random() * 1_000_000, true],
				[-Math.random() * 1_000_000, true],
				[Math.floor(Math.random() * 1_000_000), true],
				[-Math.floor(Math.random() * 1_000_000), true],
				[Infinity, true],
				[-Infinity, true]
			],
			int: [
				...numberTests,
				[5.5, false],
				[-5.5, false],
				[5.0, true],
				[-5.0, true],
				[Math.random(), false],
				[-Math.random(), false],
				[Math.floor(Math.random() * 1_000_000), true],
				[-Math.floor(Math.random() * 1_000_000), true],
				[0, true],
				[Infinity, false],
				[-Infinity, false]
			],
			positiveInt: [
				...numberTests,
				[5.5, false],
				[-5.5, false],
				[5.0, true],
				[-5.0, false],
				[0, true]
			],
			strictlyPositiveInt: [
				...numberTests,
				[5.5, false],
				[-5.5, false],
				[5.0, true],
				[-5.0, false],
				[0, false]
			],
			angleDegreesInt: [
				...numberTests,
				[5.5, false],
				[-5.5, false],
				[5.0, true],
				[-5.0, false],
				[0, true],
				[360, true],
				[361, false],
				[-1, false]
			],

			real: [
				...numberTests,
				[Math.random() * 1_000_000, true],
				[-Math.random() * 1_000_000, true],
				[Math.floor(Math.random() * 1_000_000), true],
				[-Math.floor(Math.random() * 1_000_000), true],
				[Infinity, true],
				[-Infinity, true]
			],
			positiveReal: [
				...numberTests,
				[Math.random() * 1_000_000, true],
				[-Math.random() * 1_000_000 - 1, false],
				[Math.floor(Math.random() * 1_000_000), true],
				[-Math.floor(Math.random() * 1_000_000) - 1, false],
				[0, true]
			],
			angleRadians: [
				...numberTests,
				[-1, false],
				[0, true],
				[Math.PI, true],
				[2 * Math.PI, true],
				[3 * Math.PI, false],
				[-Math.PI, false]
			],

			string: [...stringTests],
			uuidV4: [
				...stringTests.filter(([value]) => typeof value !== 'string'),
				['550e8400-e29b-41d4-a716-446655440000', true],
				['550e8400-e29b-41d4-a716', false],
				['550e8400-e29b-41d4-a716-446655440000_', false]
			],
			color: [...stringTests],

			boolean: [
				[true, true],
				[false, true],
				[0, false],
				[1, false],
				['true', false],
				['false', false],
				[null, false],
				[undefined, false],
				[{}, false],
				[() => {}, false]
			],
			array: [
				[[], true],
				[[5, 8, 984], true],
				// eslint-disable-next-line @typescript-eslint/no-array-constructor
				[new Array(), true],
				[new Uint8Array(), false],
				[null, false],
				[undefined, false],
				[5, false],
				['array', false],
				[true, false],
				[{}, false],
				[() => {}, false]
			],
			uInt8Array: [
				// eslint-disable-next-line @typescript-eslint/no-array-constructor
				[new Array(), false],
				[[5, 8, 124], false],
				[new Uint8Array(), true],
				[null, false],
				[undefined, false],
				[5, false],
				['array', false],
				[true, false],
				[{}, false],
				[() => {}, false]
			],
			objectNullable: [...objectTests, [null, true]],
			objectNonNullable: [...objectTests, [null, false]],
			undefinedOrNull: [
				...undefinedTests.filter(([value]) => value !== undefined && value !== null),
				...nullTests.filter(([value]) => value !== null && value !== undefined),
				[null, true],
				[undefined, true]
			],
			undefinedV: [...undefinedTests],
			nullV: [...nullTests],
			htmlElement: [
				[null, false],
				[undefined, false],
				[5, false],
				['htmlElement', false],
				[true, false],
				[{}, false],
				[() => {}, false],
				[[], false],
				[
					(() => {
						try {
							return new HTMLDivElement();
						} catch {
							return null;
						}
					})(),
					true
				],
				[
					(() => {
						try {
							return new HTMLSpanElement();
						} catch {
							return null;
						}
					})(),
					true
				]
			],
			functionV: [
				[null, false],
				[undefined, false],
				[5, false],
				['function', false],
				[true, false],
				[{}, false],
				[() => {}, true],
				[[], false],
				[function () {}, true],
				[Object.prototype.toString, true]
			],
			nanV: [
				[NaN, true],
				[Infinity, false],
				[-Infinity, false],
				[{}, false],
				[[], false],
				[[[]], false],
				[[0], false],
				[[1], false],
				[null, false],
				[undefined, false],
				[0, false],
				[1, false],
				[4, false],
				[7.8, false],
				['NaN', false],
				['str', false],
				['4', false],
				['4.5', false],
				['4,5', false],
				[true, false],
				[false, false]
			]
		};

		for (const test in tests) {
			it(test, () => {
				const test_ = test as ValidatorName;
				for (const [value, expected] of tests[test_]) {
					const testFunction = () => {
						const result = validators[test_].f(value);
						expect(result, test).toHaveProperty('success');
						expect(result, test).toHaveProperty('logs');
						expect(result.success, `${test} with ${value} shall be ${expected}`).toBe(expected);
					};
					if ((test as ValidatorName) === 'htmlElement') {
						try {
							testFunction();
						} catch (e) {
							console.error(
								`test ${test} silently failed, most likely due to incompatibility (${(e as Error).message})`
							);
						}
					} else {
						testFunction();
					}
				}
			});
		}
	});

	it('validate against array', () => {
		expect(validateAgainstArray([0, 1, 2], validators.positiveInt), 'positiveInt').toEqual({
			success: true,
			logs: ''
		});
		expect(
			validateAgainstArray([0, 1, 2], validators.strictlyPositiveInt),
			'strictlyPositiveInt'
		).toEqual({
			success: false,
			logs: 'The value [0] does not match the type criteria (strictlyPositiveInt).\nContext:\nInvalid value: 0\n'
		});
	});

	it('validate against simple record', () => {
		const testValidator: ValidatorRecord = {
			a: validators.number,
			b: validators.string,
			c: validators.boolean
		};

		expect(validateAgainstRecord({ a: 5, b: '5', c: true }, testValidator), 'valid').toEqual({
			success: true,
			logs: ''
		});
		expect(validateAgainstRecord({ a: 5, b: '5', c: 5 }, testValidator), 'invalid').toEqual({
			success: false,
			logs: 'The key "c" does not match the type criteria (boolean).\nContext:\nInvalid value: 5\n'
		});
	});

	it('validate complex structure', () => {
		const testValidator: ValidatorRecord = {
			a: validators.number,
			b: arrayValidator(validators.string),
			c: recordValidator(
				{
					d: validators.string,
					e: validators.number
				},
				'c'
			),
			f: arrayValidator(
				recordValidator(
					{
						g: validators.string,
						h: validators.number
					},
					'f'
				)
			)
		};

		// valid
		expect(
			validateAgainstRecord(
				{ a: 5, b: ['5', '6'], c: { d: '5', e: 5 }, f: [{ g: 'g', h: 456 }, { g: 'str', h: 562314 }] },
				testValidator
			),
			'valid'
		).toEqual({ success: true, logs: '' });
		
		// invalid 1
		expect(
			validateAgainstRecord(
				{ a: 5, b: ['5', '6'], c: { d: '5', e: '5' }, f: [{ g: 'g', h: 456 }] },
				testValidator
			),
			'invalid 1'
		).toEqual({ success: false, logs: 'The key "c" does not match the type criteria (c).\nContext:\nThe key "e" does not match the type criteria (number).\nContext:\nInvalid value: 5\n' });
		
		// invalid 2
		expect(
			validateAgainstRecord({ a: 5, b: ['5', 6], c: { d: '5', e: 5 }, f: [{ g: 'g', h: 456 }] }, testValidator),
			'invalid 2'
		).toEqual({ success: false, logs: 'The key "b" does not match the type criteria (string[]).\nContext:\nThe value [1] does not match the type criteria (string).\nContext:\nInvalid value: 6\n' });
		
		// invalid 3
		expect(
			validateAgainstRecord({ a: 5, b: ['5', '6'], c: { d: '5', e: 5 }, f: [{ g: 'g', h: '456' }] }, testValidator),
			'invalid 3'
		).toEqual({ success: false, logs: 'The key \"f\" does not match the type criteria (f[]).\nContext:\nThe value [0] does not match the type criteria (f).\nContext:\nThe key \"h\" does not match the type criteria (number).\nContext:\nInvalid value: 456\n' });
	});
});
