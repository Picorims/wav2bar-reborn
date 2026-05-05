/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/


import saveV4Schema from '$lib/schemas/save_v4.json';
import type { Wav2BarSaveV4 } from '$lib/types/schemas/save_v4';
import Ajv from 'ajv';

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

const ajv = new Ajv({ useDefaults: true });
export const validateSaveV4 = ajv.compile(saveV4Schema);
export const validateSaveV4VisualObject = ajv.compile({
	$schema: 'http://json-schema.org/draft-07/schema#',
	definitions: saveV4Schema.definitions,
	$ref: '#/definitions/visual_object'
});

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
