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