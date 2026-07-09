/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { Wav2BarSaveV4 } from '$lib/types/schemas/save_v4';
import ajvSaveV4Validator from '$lib/schemas/compiled/save_v4_validate_esm';
import ajvSaveV4VisualObjectValidator from '$lib/schemas/compiled/save_v4_visual_object_validate_esm';

/**
 * - For versions beta 0.3.0 indev and above
 * - backward compatibility: none
 * - Breaking changes: see legacy project
 * - Other changes: see legacy project
 */

export const EXTENSION_V4 = '.w2bzip';
export const ARCHIVE_STRUCTURE_V4 = {
	/** stores all the save data */
	'data.json': null,
	assets: {
		'[OBJECT_ID]': {
			background: {
				'[IMAGE_NAME]': null
			}
		},
		audio: {
			'[AUDIO_FILENAME]': null
		}
	}
} as const;

// Check package.json - "npm run json2ts" script to update the types associated to JSON schemas.

export const validateSaveV4 = ajvSaveV4Validator;
export const validateSaveV4VisualObject = ajvSaveV4VisualObjectValidator;

// =========================================================
// PROPERTIES ==============================================
// =========================================================

type VisualObjectV4Type = Wav2BarSaveV4['objects'][string]['visual_object_type'];
export const visualObject_V4_types: Readonly<VisualObjectV4Type[]> = [
	'shape',
	'particle_flow',
	'text',
	'timer_straight_bar',
	'timer_straight_line_point',
	'visualizer_straight_bar',
	'visualizer_straight_wave',
	'visualizer_circular_bar'
] as const;
