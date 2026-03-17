/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import saveV5Schema from '$lib/schemas/save_v5.json';
import type { Wav2BarSaveV5 } from '$lib/types/schemas/save_v5';
import Ajv from 'ajv';

/**
 * - For versions 1.0.0-beta.1 indev and above
 * - backward compatibility: none
 * - Breaking changes: CSS properties (border radius, box shadow, background size, gradient) are replaced by typed objects.
 * - Other changes: none.
 */

export const EXTENSION_V5 = '.w2bzip';
export const ARCHIVE_STRUCTURE_V5 = {
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
export const validateSaveV5 = ajv.compile(saveV5Schema);
export const validateSaveV5VisualObject = ajv.compile({
	$schema: 'http://json-schema.org/draft-07/schema#',
	definitions: saveV5Schema.definitions,
	$ref: '#/definitions/visual_object'
});

type VisualObjectV5Type = Wav2BarSaveV5['objects'][string]['visual_object_type'];
export const visualObject_V5_types: Readonly<VisualObjectV5Type[]> = [
	'shape',
	'particle_flow',
	'text',
	'timer_straight_bar',
	'timer_straight_line_point',
	'visualizer_straight_bar',
	'visualizer_straight_wave',
	'visualizer_circular_bar'
] as const;
