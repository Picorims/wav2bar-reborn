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

import { version } from '$app/environment';
import type {
	AngleDegreesInt,
	Color,
	Int,
	JsonLike,
	PositiveInt,
	PositiveReal,
	StrictlyPositiveInt,
	UUIDv4
} from '$lib/types/common_types';
import {
	dictionaryValidator,
	enumValidator,
	fixedLengthArrayValidator,
	loggedWrapper,
	recordValidator,
	validateAgainstRecord,
	validators,
	type ValidatorRecord,
	type ValueLoggedValidator
} from '$lib/types/validator';

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

export interface Save_V4 {
	save_version: 4;
	/** last version modifying the save */
	software_version_used: string;
	/** first version creating the save */
	software_version_first_created: string;
	/** video resolution */
	screen: {
		width: StrictlyPositiveInt;
		height: StrictlyPositiveInt;
	};
	fps: StrictlyPositiveInt;
	audio_filename: string;
	objects: Record<UUIDv4, JsonLike>;
}
const partialV4Validator = {
	save_version: loggedWrapper(function v4(value: unknown) {
		return value === 4;
	}),
	software_version_used: validators.string,
	software_version_first_created: validators.string,
	screen: recordValidator({
		width: validators.strictlyPositiveInt,
		height: validators.strictlyPositiveInt
	}, 'Screen'),
	fps: validators.strictlyPositiveInt,
	audio_filename: validators.string
};
// =========================================================
// PROPERTIES ==============================================
// =========================================================

export type VisualObject_V4_Type =
	| 'shape'
	| 'particle_flow'
	| 'text'
	| 'timer_straight_bar'
	| 'timer_straight_line_point'
	| 'visualizer_straight_bar'
	| 'visualizer_straight_wave'
	| 'visualizer_circular_bar';
const visualObject_V4_types = [
	'shape',
	'particle_flow',
	'text',
	'timer_straight_bar',
	'timer_straight_line_point',
	'visualizer_straight_bar',
	'visualizer_straight_wave',
	'visualizer_circular_bar'
];
const visualObject_V4_TypeValidator = enumValidator(visualObject_V4_types, validators.string);

/** All visual objects handle these properties.
 * Their interpretation may slightly differ from
 * one object to another, although it should remain
 * somewhat consistent.
 */
export interface VisualObject_V4<T extends VisualObject_V4_Type> {
	visual_object_type: T;
	/** random by default */
	name: string;
	layer: PositiveInt;
	coordinates: {
		x: Int;
		y: Int;
	};
	size: {
		width: PositiveInt;
		height: PositiveInt;
	};
	/** in degrees */
	rotation: AngleDegreesInt;
	/** List of `<filter>` tags separated by `[#]` with no `<script>` tag. */
	svg_filter: string;
}
const partialVisualObject_V4Validator = {
	visual_object_type: visualObject_V4_TypeValidator,
	name: validators.string,
	layer: validators.positiveInt,
	coordinates: recordValidator({
		x: validators.int,
		y: validators.int
	}, 'Coordinates'),
	size: recordValidator({
		width: validators.positiveInt,
		height: validators.positiveInt
	}, 'Size'),
	rotation: validators.angleDegreesInt,
	svg_filter: validators.string
};

export interface Supports_BorderRadius_V4 {
	/**
	 * CSS border radius
	 */
	border_radius: string;
}
const supports_BorderRadius_V4Validator = {
	border_radius: validators.string
};

export interface Supports_BoxShadow_V4 {
	box_shadow: string;
}
const supports_BoxShadow_V4Validator = {
	box_shadow: validators.string
};

export interface Supports_Background_V4 {
	background: {
		type: 'color' | 'gradient' | 'image';
		/** hex, rgb, rgba, hsv color, CSS syntax. */
		last_color: string;
		/** CSS gradient */
		last_gradient: string;
		/**
		 * name of the image with the extension,
		 * stored in the background folder of the object.
		 */
		last_image: string;
		/** contain | cover | x% | x% y% */
		size: string;
		repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
	};
}
const supports_Background_V4Validator = {
	background: recordValidator({
		type: enumValidator(['color', 'gradient', 'image'], validators.string),
		last_color: validators.string,
		last_gradient: validators.string,
		last_image: validators.string,
		size: validators.string,
		repeat: enumValidator(['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], validators.string)
	}, 'Background')
};

export interface Supports_ParticleProps_V4 {
	particle_radius_range: [StrictlyPositiveInt, StrictlyPositiveInt];
	flow_type: 'radial' | 'directional';
	flow_center: [Int, Int];
	flow_direction: AngleDegreesInt;
	particle_spawn_probability: PositiveReal;
	/** how many times per frame an attempt to spawn a particle is done.
	 * Thus, it also defines the maximum of spawned particles per frame
	 */
	particle_spawn_tests: StrictlyPositiveInt;
}
const supports_ParticleProps_V4Validator = {
	particle_radius_range: fixedLengthArrayValidator(validators.strictlyPositiveInt, 2),
	flow_type: enumValidator(['radial', 'directional'], validators.string),
	flow_center: fixedLengthArrayValidator(validators.int, 2),
	flow_direction: validators.angleDegreesInt,
	particle_spawn_probability: validators.positiveReal,
	particle_spawn_tests: validators.strictlyPositiveInt
};

export interface Supports_Color_V4 {
	/** hex, rgb, rgba */
	color: Color;
}
const supports_Color_V4Validator = {
	color: validators.color
};

export interface Supports_TextProps_V4 {
	text_type: 'any' | 'time';
	text_content: string;
	font_size: StrictlyPositiveInt;
	text_decoration: {
		italic: boolean;
		bold: boolean;
		underline: boolean;
		overline: boolean;
		line_through: boolean;
	};
	text_align: {
		horizontal: 'left' | 'center' | 'right';
	};
	/** CSS text shadow */
	text_shadow: string;
}
const supports_TextProps_V4Validator = {
	text_type: enumValidator(['any', 'time'], validators.string),
	text_content: validators.string,
	font_size: validators.strictlyPositiveInt,
	text_decoration: recordValidator({
		italic: validators.boolean,
		bold: validators.boolean,
		underline: validators.boolean,
		overline: validators.boolean,
		line_through: validators.boolean
	}, 'TextDecoration'),
	text_align: recordValidator({
		horizontal: enumValidator(['left', 'center', 'right'], validators.string)
	}, 'TextAlign'),
	text_shadow: validators.string
};

export interface Supports_BorderThickness_V4 {
	border_thickness: PositiveInt;
}
const supports_BorderThickness_V4Validator = {
	border_thickness: validators.positiveInt
};

export interface Supports_TimerInnerSpacing_V4 {
	inner_spacing: PositiveInt;
}
const supports_TimerInnerSpacing_V4Validator = {
	inner_spacing: validators.positiveInt
};

export interface Supports_VisualizerProps_V4 {
	visualizer_points_count: StrictlyPositiveInt;
	/**
	 * Drawn range for the visualizer.
	 * 0 maps to 20Hz and 1023 maps to 20000Hz.
	 * The scale is logarithmic.
	 */
	visualizer_analyzer_range: [PositiveInt, PositiveInt];
	/** Interpolation type of the frequency array between frames. */
	visualization_smoothing_type: 'proportional_decrease' | 'linear_decrease' | 'average';
	/** Parameter for the visualization smoothing type. Its behaviour differs depending of the mode. */
	visualization_smoothing_factor: PositiveReal;
}
const supports_VisualizerProps_V4Validator = {
	visualizer_points_count: validators.strictlyPositiveInt,
	visualizer_analyzer_range: fixedLengthArrayValidator(validators.positiveInt, 2),
	visualization_smoothing_type: enumValidator(
		['proportional_decrease', 'linear_decrease', 'average'],
		validators.string
	),
	visualization_smoothing_factor: validators.positiveReal
};

export interface Supports_VisualizerBarProps_V4 {
	visualizer_bar_thickness: PositiveInt;
}
const supports_VisualizerBarProps_V4Validator = {
	visualizer_bar_thickness: validators.positiveInt
};

export interface Supports_VisualizerCircularProps_V4 {
	visualizer_radius: PositiveInt;
}
const supports_VisualizerCircularProps_V4Validator = {
	visualizer_radius: validators.positiveInt
};

// =========================================================
// VISUAL OBJECTS ==========================================
// =========================================================

export type Shape_V4 = VisualObject_V4<'shape'> &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4 &
	Supports_Background_V4;
const shape_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_BorderRadius_V4Validator,
	...supports_BoxShadow_V4Validator,
	...supports_Background_V4Validator
};

export type ParticleFlow_V4 = VisualObject_V4<'particle_flow'> &
	Supports_ParticleProps_V4 &
	Supports_Color_V4;
const particleFlow_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_ParticleProps_V4Validator,
	...supports_Color_V4Validator
};

export type Text_V4 = VisualObject_V4<'text'> & Supports_TextProps_V4 & Supports_Color_V4;
const text_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_TextProps_V4Validator,
	...supports_Color_V4Validator
};

export type TimerStraightBar_V4 = VisualObject_V4<'timer_straight_bar'> &
	Supports_Color_V4 &
	Supports_BorderThickness_V4 &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4 &
	Supports_TimerInnerSpacing_V4;
const timerStraightBar_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_Color_V4Validator,
	...supports_BorderThickness_V4Validator,
	...supports_BorderRadius_V4Validator,
	...supports_BoxShadow_V4Validator,
	...supports_TimerInnerSpacing_V4Validator
};

export type TimerStraightLinePoint_V4 = VisualObject_V4<'timer_straight_line_point'> &
	Supports_Color_V4 &
	Supports_BorderThickness_V4 &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4;
const timerStraightLinePoint_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_Color_V4Validator,
	...supports_BorderThickness_V4Validator,
	...supports_BorderRadius_V4Validator,
	...supports_BoxShadow_V4Validator
};

export type VisualizerStraightBar_V4 = VisualObject_V4<'visualizer_straight_bar'> &
	Supports_VisualizerProps_V4 &
	Supports_Color_V4 &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4;
const visualizerStraightBar_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_VisualizerProps_V4Validator,
	...supports_Color_V4Validator,
	...supports_BorderRadius_V4Validator,
	...supports_BoxShadow_V4Validator
};

export type VisualizerStraightWave_V4 = VisualObject_V4<'visualizer_straight_wave'> &
	Supports_VisualizerProps_V4 &
	Supports_Color_V4;
const visualizerStraightWave_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_VisualizerProps_V4Validator,
	...supports_Color_V4Validator
};

export type VisualizerCircularBar_V4 = VisualObject_V4<'visualizer_circular_bar'> &
	Supports_VisualizerProps_V4 &
	Supports_Color_V4 &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4 &
	Supports_VisualizerBarProps_V4 &
	Supports_VisualizerCircularProps_V4;
const visualizerCircularBar_V4Validator = {
	...partialVisualObject_V4Validator,
	...supports_VisualizerProps_V4Validator,
	...supports_Color_V4Validator,
	...supports_BorderRadius_V4Validator,
	...supports_BoxShadow_V4Validator,
	...supports_VisualizerBarProps_V4Validator,
	...supports_VisualizerCircularProps_V4Validator
};

// =========================================================
// GLOBAL VALIDATION =======================================
// =========================================================


const visualObjectValidatorDict_V4: Record<VisualObject_V4_Type, ValidatorRecord> = {
	shape: shape_V4Validator,
	particle_flow: particleFlow_V4Validator,
	text: text_V4Validator,
	timer_straight_bar: timerStraightBar_V4Validator,
	timer_straight_line_point: timerStraightLinePoint_V4Validator,
	visualizer_straight_bar: visualizerStraightBar_V4Validator,
	visualizer_straight_wave: visualizerStraightWave_V4Validator,
	visualizer_circular_bar: visualizerCircularBar_V4Validator
};
const visualObjectValidator_V4: ValueLoggedValidator = {
	f: (value: unknown) => {
		if (!validators.objectNonNullable.f(value).success)
			return validators.objectNonNullable.f(value);
		const value_ = value as Record<string, unknown>;
		if (!Object.prototype.hasOwnProperty.call(value_, 'visual_object_type')) {
			return { success: false, logs: 'missing type property.\n' };
		}
		if (!validators.string.f(value_.visual_object_type).success) {
			return validators.string.f(value_.visual_object_type);
		}
		const typeValidator = enumValidator(visualObject_V4_types, validators.string);
		if (
			!typeValidator.f(value_.visual_object_type).success
		) {
			return typeValidator.f(value_.visual_object_type);
		}
		const type: VisualObject_V4_Type = value_.visual_object_type as VisualObject_V4_Type;
		return validateAgainstRecord(value, visualObjectValidatorDict_V4[type]);
	},
	name: 'VisualObjectV4'
};
export const saveValidator_V4: ValidatorRecord = {
	...partialV4Validator,
	objects: dictionaryValidator(validators.uuidV4, visualObjectValidator_V4)
};

// =========================================================
// DEFAULTS ================================================
// =========================================================

export const defaultSaveConfig_V4 = (): Save_V4 => ({
	save_version: 4,
	software_version_used: version,
	software_version_first_created: version,
	screen: {
		width: 1920 as StrictlyPositiveInt,
		height: 1080 as StrictlyPositiveInt
	},
	fps: 60 as StrictlyPositiveInt,
	audio_filename: '',
	objects: {}
});