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

/**
 * - For versions 1.0.0-beta.1 and above
 * - backward compatibility: none
 * - Breaking changes: TODO
 * - Other changes: TODO
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
// =========================================================
// PROPERTIES ==============================================
// =========================================================

/** All visual objects handle these properties.
 * Their interpretation may slightly differ from
 * one object to another, although it should remain
 * somewhat consistent.
 */
export interface VisualObject_V4<T extends string> {
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

export interface Supports_BorderRadius_V4 {
	/**
	 * CSS border radius
	 */
	border_radius: string;
}

export interface Supports_BoxShadow_V4 {
	box_shadow: string;
}

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

export interface Supports_Color_V4 {
	/** hex, rgb, rgba */
	color: Color;
}

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

export interface Supports_BorderThickness_V4 {
	border_thickness: PositiveInt;
}

export interface Supports_TimerInnerSpacing_V4 {
	inner_spacing: PositiveInt;
}

export interface Supports_VisualizerProps_V4 {
	visualizer_points_count: StrictlyPositiveInt;
	/**
	 * Drawn range for the visualizer.
	 * 0 maps to 20Hz and 1023 maps to 20000Hz.
	 * The scale is logarithmic.
	 */
	visualizer_analyzer_range: [PositiveInt, PositiveInt];
	/** Interpolation type of the frequency array between frames. */
	visualization_smoothing_type: "proportional_decrease" | "linear_decrease" | "average";
	/** Parameter for the visualization smoothing type. Its behaviour differs depending of the mode. */
	visualization_smoothing_factor: PositiveReal;
}

export interface Supports_VisualizerBarProps_V4 {
	visualizer_bar_thickness: PositiveInt;
}

export interface Supports_VisualizerCircularProps_V4 {
	visualizer_radius: PositiveInt;
}

// =========================================================
// VISUAL OBJECTS ==========================================
// =========================================================

export type ShapeV4 = VisualObject_V4<'shape'> &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4 &
	Supports_Background_V4;

export type ParticleFlowV4 = VisualObject_V4<'particle_flow'> &
	Supports_ParticleProps_V4 &
	Supports_Color_V4;

export type TextV4 = VisualObject_V4<'text'> & Supports_TextProps_V4 & Supports_Color_V4;

export type TimerStraightBarV4 = VisualObject_V4<'timer_straight_bar'> &
	Supports_Color_V4 &
	Supports_BorderThickness_V4 &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4 &
	Supports_TimerInnerSpacing_V4;

export type TimerStraightLinePointV4 = VisualObject_V4<'timer_straight_line_point'> &
	Supports_Color_V4 &
	Supports_BorderThickness_V4 &
	Supports_BorderRadius_V4 &
	Supports_BoxShadow_V4;

export type VisualizerStraightBarV4 = VisualObject_V4<'visualizer_straight_bar'>
	& Supports_VisualizerProps_V4
	& Supports_Color_V4
	& Supports_BorderRadius_V4
	& Supports_BoxShadow_V4;

export type VisualizerStraightWaveV4 = VisualObject_V4<'visualizer_straight_wave'>
	& Supports_VisualizerProps_V4
	& Supports_Color_V4

export type VisualizerCircularBarV4 = VisualObject_V4<'visualizer_circular_bar'>
	& Supports_VisualizerProps_V4
	& Supports_Color_V4
	& Supports_BorderRadius_V4
	& Supports_BoxShadow_V4
	& Supports_VisualizerBarProps_V4
	& Supports_VisualizerCircularProps_V4;
	