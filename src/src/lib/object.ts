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
 * Shorthand for `Object.prototype.hasOwnProperty.call(object, prop)`.
 * @param object The object to call `hasOwnProperty` on
 * @param prop The property to seek
 * @returns {Boolean}
 */
export function objHasOwnProp(object: object, prop: PropertyKey) {
    return Object.prototype.hasOwnProperty.call(object, prop);
}