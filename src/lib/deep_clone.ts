/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { objHasOwnProp } from "./object";
import type { JsonArray, JsonLike, JsonObject } from "./types/common_types";
import { validators } from "./types/validator";

/**
 * Deep clones a value. support primitives, arrays (composed of the same things),
 * and objects (composed of the same things).
 * @param {*} value value to clone
 * @returns {*} copy
 */
export function deepClone(value: JsonLike, depth=0): JsonLike {
    let clone;

    if (validators.array.f(value).success) {
        clone = arrayDeepClone(value as JsonArray, depth++);
    } else if (validators.objectNonNullable.f(value).success) {
        clone = objDeepClone(value as JsonObject, depth++);
    } else {
        clone = value;
    }            

    return clone;
}


export function typedDeepClone<T>(value: T, depth=0): T {
    return deepClone(value as unknown as JsonLike, depth) as T;
}



/**
 * Deep clones an object. support primitives, arrays (composed of the same things),
 * and objects (composed of the same things).
 * @param {Object} object object to clone
 * @returns {Object} copy
 */
function objDeepClone(object: JsonObject, depth=0) {
    const new_obj: JsonLike = {};
    for (const key in object) {
        if (objHasOwnProp(object, key)) {
            new_obj[key] = deepClone(object[key], depth++);
        }
    }
    return new_obj;
}


/**
 * Deep clones an array. support primitives, arrays (composed of the same things),
 * and objects (composed of the same things).
 * @param {Array} array array to clone
 * @returns {Array} copy
 */

function arrayDeepClone(array: JsonArray, depth=0) {
    const new_array: JsonLike = [];
    for (let i = 0; i < array.length; i++) {
        new_array[i] = deepClone(array[i], depth++);
    }
    return new_array;
}