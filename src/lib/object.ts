/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

/**
 * Shorthand for `Object.prototype.hasOwnProperty.call(object, prop)`.
 * @param object The object to call `hasOwnProperty` on
 * @param prop The property to seek
 * @returns {Boolean}
 */
export function objHasOwnProp(object: object, prop: PropertyKey) {
	return Object.prototype.hasOwnProperty.call(object, prop);
}
