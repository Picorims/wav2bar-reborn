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

import { ARCHIVE_STRUCTURE_V4, defaultSaveConfig_V4, EXTENSION_V4, saveValidator_V4, type Save_V4, type VisualObject_V4_Type } from './save_v4';

export const EXTENSION = EXTENSION_V4;
export const ARCHIVE_STRUCTURE = ARCHIVE_STRUCTURE_V4;

export type Save = Save_V4;

// =========================================================
// PROPERTIES ==============================================
// =========================================================

export type VisualObject_Type = VisualObject_V4_Type;


// =========================================================
// GLOBAL VALIDATION =======================================
// =========================================================

export const saveValidator = saveValidator_V4;

// =========================================================
// DEFAULTS ================================================
// =========================================================

export const defaultSaveConfig = defaultSaveConfig_V4;