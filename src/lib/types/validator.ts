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

import type { Int } from './common_types';

/**
 * Retunrs true only if the given value matches the type criterias.
 */
export type Validator = (value: unknown) => boolean;
export interface LoggedValidatorResult {
	success: boolean;
	logs: string;
}

export interface ValueLoggedValidator {
	f(value: unknown): LoggedValidatorResult;
	name: string;
}

export type RecordLoggedValidator = (
	value: unknown,
	validatorRecord: ValidatorRecord
) => LoggedValidatorResult;

export type ArrayLoggedValidator = (
	value: unknown[],
	validator: ValueLoggedValidator
) => LoggedValidatorResult;

export type LoggedValidator = ValueLoggedValidator | RecordLoggedValidator | ArrayLoggedValidator;

export type ValidatorRecord = Record<string, ValueLoggedValidator>;

const number: Validator = (value) => typeof value === 'number' && !isNaN(value);
const int: Validator = (value) => number(value) && Number.isInteger(value);
const positiveInt: Validator = (value) => int(value) && (value as Int) >= 0;
const strictlyPositiveInt: Validator = (value) => int(value) && (value as Int) > 0;
const angleDegreesInt: Validator = (value) => positiveInt(value) && (value as Int) <= 360;

const real: Validator = (value) => number(value);
const positiveReal: Validator = (value) => real(value) && (value as number) >= 0;
const angleRadians: Validator = (value) => positiveReal(value) && (value as number) <= 2 * Math.PI;

const string: Validator = (value) => typeof value === 'string';
const uuidV4: Validator = (value) => string(value) && (value as string).length === 36;
const color: Validator = (value) => string(value);

const boolean: Validator = (value) =>
	typeof value === 'boolean' && (value === true || value === false);

/** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#using_array.isarray */
const array: Validator = (value) => Array.isArray(value);

const uInt8Array: Validator = (value) => value instanceof Uint8Array;
const objectNullable: Validator = (value) => value === null || typeof value === 'object';
const objectNonNullable: Validator = (value) => typeof value === 'object' && value !== null;
const undefinedOrNull: Validator = (value) => value === undefined || value === null;
const undefinedV: Validator = (value) => value === undefined;
const nullV: Validator = (value) => value === null;
const htmlElement: Validator = (value) => value instanceof HTMLElement;
const functionV: Validator = (value) => typeof value === 'function';

/**
 * Returns if the value is strictly equals to NaN. It differs from
 * isNaN that only returns if the value is equivalent to NaN.
 *
 * @param {*} value
 * @returns {Boolean}
 * @see https://dorey.github.io/JavaScript-Equality-Table/
 */
const nanV: Validator = (value) => {
	// isNaN is more for safety than anything else
	// see https://dorey.github.io/JavaScript-Equality-Table/
	// the only value not strictly equal to itself of type number is NaN.
	// Other values not strictly equal to themselves are of type object.

	return typeof value === 'number' && value !== value && isNaN(value);
};

// ==================================================================================
// ==================================================================================
// ==================================================================================

export const validateAgainstRecord: RecordLoggedValidator = (value, validatorRecord) => {
	if (validatorRecord === undefined) {
		throw new Error('The validator object must be specified here.');
	}
	if (!objectNonNullable(value)) {
		return {
			success: false,
			logs: 'The value is not an object.'
		};
	}
	const result = {
		success: true,
		logs: ''
	};
	const valueO = value as Record<string, unknown>;
	for (const key in validatorRecord) {
		if (undefinedV(valueO[key])) {
			result.logs += `The key "${key}" is undefined.\n`;
			if (result.success) result.success = false;
			continue;
		}
		const testResult = validatorRecord[key].f(valueO[key]);
		if (!testResult.success) {
			result.logs += `The key "${key}" does not match the type criteria (${validatorRecord[key].name}).\n`;
			result.logs += `Context:\n`;
			result.logs += testResult.logs;
			if (result.success) result.success = false;
		}
	}
	return result;
};

export const validateAgainstArray: ArrayLoggedValidator = (value, validator) => {
	if (validator === undefined) {
		throw new Error('The validator object must be specified here.');
	}
	if (!array(value)) {
		return {
			success: false,
			logs: 'The value is not an array.'
		};
	}
	const result = {
		success: true,
		logs: ''
	};
	const valueA = value as unknown[];
	for (let i = 0; i < valueA.length; i++) {
		const v = valueA[i];
		const testResult = validator.f(v);
		if (!testResult.success) {
			result.logs += `The value [${i}] does not match the type criteria (${validator.name}).\n`;
			result.logs += `Context:\n`;
			result.logs += testResult.logs;
			if (result.success) result.success = false;
		}
	}
	return result;
};

// ==================================================================================
// ==================================================================================
// ==================================================================================

export const loggedWrapper = (validator: Validator): ValueLoggedValidator => ({
	f: (v) => {
		const success = validator(v);
		return { success: success, logs: success? '' : `Invalid value: ${v}\n` };
	},
	name: validator.name
});

/**
 * Declare a nested array validator.
 * @param validator 
 * @returns 
 */
export const arrayValidator = (validator: ValueLoggedValidator): ValueLoggedValidator => ({
	f: (v) => validateAgainstArray(v as unknown[], validator),
	name: validator.name + '[]',
});

/**
 * Declare a fixed length nested array validator.
 * @param validator 
 * @param length 
 * @returns 
 */
export const fixedLengthArrayValidator = (validator: ValueLoggedValidator, length: number): ValueLoggedValidator => ({
	f: (v) => {
		if (!validators.array.f(v).success) {
			return {
				success: false,
				logs: 'The value is not an array.\n'
			};
		}
		if ((v as unknown[]).length !== length) {
			return {
				success: false,
				logs: `The array does not have the correct length (${length}).\n`
			};
		}
		return validateAgainstArray(v as unknown[], validator);
		
	},
	name: validator.name + '['+length+']',
});

/**
 * Declare a nested record validator.
 * @param validatorRecord 
 * @param name 
 * @returns 
 */
export const recordValidator = (validatorRecord: ValidatorRecord, name: string): ValueLoggedValidator => ({
	f: (v) => validateAgainstRecord(v, validatorRecord),
	name: name,
});

/**
 * Declare a dictionary validator, with a validator for the key
 * in place of enforcing keys.
 * @param keyValidator 
 * @param valueValidator 
 * @returns 
 */
export const dictionaryValidator = (keyValidator: ValueLoggedValidator, valueValidator: ValueLoggedValidator): ValueLoggedValidator => ({
	f: (v) => {
		if (!objectNonNullable(v)) {
			return {
				success: false,
				logs: 'The value is not an object.'
			};
		}
		const result = {
			success: true,
			logs: ''
		};
		for (const e of Object.entries(v as Record<string, unknown>)) {
			const [key, value] = e;
			const keyTestResult = keyValidator.f(key);
			if (!keyTestResult.success) {
				result.logs += `The key "${key}" does not match the type criteria (${keyValidator.name}).\n`;
				result.logs += `Context:\n`;
				result.logs += keyTestResult.logs;
				if (result.success) result.success = false;
			}
			const valueTestResult = valueValidator.f(value);
			if (!valueTestResult.success) {
				result.logs += `The value "${value}" does not match the type criteria (${valueValidator.name}).\n`;
				result.logs += `Context:\n`;
				result.logs += valueTestResult.logs;
				if (result.success) result.success = false;
			}
		}
		return result;
	},
	name: `Record<${keyValidator.name}, ${valueValidator.name}}>`,
});

/**
 * Validates both that the value matches the provided validator
 * and that it is in the provided list.
 * @param validList 
 * @param validator 
 * @returns 
 */
export const enumValidator = <T>(validList: T[], validator: ValueLoggedValidator): ValueLoggedValidator => ({
	f: (v) => {
		if (!validator.f(v).success) {
			return validator.f(v);
		}
		if (!validList.includes(v as T)) {
			return {
				success: false,
				logs: `The value "${v}" is not in the valid list: ${validList.join(", ")}.\n`
			};
		}
		return { success: true, logs: '' };
	},
	name: `enum<${validList.join("|")}>`,
});

/**
 * Each validator must be a logged one.
 */
const validatorsLocal = {
	number: loggedWrapper(number),
	int: loggedWrapper(int),
	positiveInt: loggedWrapper(positiveInt),
	strictlyPositiveInt: loggedWrapper(strictlyPositiveInt),
	angleDegreesInt: loggedWrapper(angleDegreesInt),

	real: loggedWrapper(real),
	positiveReal: loggedWrapper(positiveReal),
	angleRadians: loggedWrapper(angleRadians),

	string: loggedWrapper(string),
	uuidV4: loggedWrapper(uuidV4),
	color: loggedWrapper(color),

	boolean: loggedWrapper(boolean),
	array: loggedWrapper(array),
	uInt8Array: loggedWrapper(uInt8Array),
	objectNullable: loggedWrapper(objectNullable),
	objectNonNullable: loggedWrapper(objectNonNullable),
	undefinedOrNull: loggedWrapper(undefinedOrNull),
	undefinedV: loggedWrapper(undefinedV),
	nullV: loggedWrapper(nullV),
	htmlElement: loggedWrapper(htmlElement),
	functionV: loggedWrapper(functionV),
	nanV: loggedWrapper(nanV)
} as const;

export type ValidatorName = keyof typeof validatorsLocal;

/**
 * Returns an object `{success: boolean, logs: string}`,
 * where success is true only if the given value matches the type criterias.
 * For detailed information about the behavior of the different functions,
 * check this module's functions documentation.
 */
export const validators: Readonly<Record<ValidatorName, ValueLoggedValidator>> = validatorsLocal;
