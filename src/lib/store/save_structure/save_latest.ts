/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

// import { ARCHIVE_STRUCTURE_V4, defaultParticleFlow_V4, defaultSaveConfig_V4, defaultShape_V4, defaultText_V4, defaultTimerStraightBar_V4, defaultTimerStraightLinePoint_V4, defaultVisualizerCircularBar_V4, defaultVisualizerStraightBar_V4, defaultVisualizerStraightWave_V4, EXTENSION_V4, saveValidator_V4, visualObject_V4_types, type Save_V4, type VisualObjectInterface_V4, type VisualObject_V4_Type, type VisualObject_V4, type Supports_BorderRadius_V4, type Supports_BoxShadow_V4, type Supports_Background_V4, type Supports_ParticleProps_V4, type Supports_Color_V4, type Supports_TextProps_V4, type Supports_BorderThickness_V4, type Supports_TimerInnerSpacing_V4, type Supports_VisualizerProps_V4, type Supports_VisualizerBarProps_V4, type Supports_VisualizerCircularProps_V4, type Text_V4 } from './save_v4';
import type {
	Text,
	VisualizerStraightBar,
	Wav2BarSaveV4,
	SupportsBorderRadius,
	SupportsBackground,
	SupportsBorderThickness,
	SupportsBoxShadow,
	SupportsColor,
	SupportsTextProps,
	SupportsParticleProps,
	SupportsTimerInnerSpacing,
	SupportsVisualizerBarProps,
	SupportsVisualizerCircularProps,
	SupportsVisualizerProps,
	VisualizerStraightWave,
	VisualizerCircularBar,
	TimerStraightLinePoint,
	TimerStraightBar,
	ParticleFlow
} from '$lib/types/schemas/save_v4';
import {
	ARCHIVE_STRUCTURE_V4,
	EXTENSION_V4,
	validateSaveV4,
	validateSaveV4VisualObject,
	visualObject_V4_types
} from './save_v4';

export const EXTENSION = EXTENSION_V4;
export const ARCHIVE_STRUCTURE = ARCHIVE_STRUCTURE_V4;

export const validateSave = validateSaveV4;
export const validateSaveVisualObject = validateSaveV4VisualObject;

export type Save = Wav2BarSaveV4;
export type VisualObject = Wav2BarSaveV4['objects'][string];
export type SaveVO_Text = Text;
export type SaveVO_VisualizerStraightBar = VisualizerStraightBar;
export type SaveVO_VisualizerCircularBar = VisualizerCircularBar;
export type SaveVO_VisualizerStraightWave = VisualizerStraightWave;
export type SaveVO_TimerStraightLinePoint = TimerStraightLinePoint;
export type SaveVO_TimerStraightBar = TimerStraightBar;
export type SaveVO_ParticleFlow = ParticleFlow;

// =========================================================
// PROPERTIES ==============================================
// =========================================================

export type VisualObject_Type = Save['objects'][string]['visual_object_type'];
export const visualObject_types = visualObject_V4_types;
export type VisualObjectInterface<T extends VisualObject_Type> = Save['objects'][string] & {
	visual_object_type: T;
};
export type Supports_BorderRadius = SupportsBorderRadius;
export type Supports_BoxShadow = SupportsBoxShadow;
export type Supports_Background = SupportsBackground;
export type Supports_ParticleProps = SupportsParticleProps;
export type Supports_Color = SupportsColor;
export type Supports_TextProps = SupportsTextProps;
export type Supports_BorderThickness = SupportsBorderThickness;
export type Supports_TimerInnerSpacing = SupportsTimerInnerSpacing;
export type Supports_VisualizerProps = SupportsVisualizerProps;
export type Supports_VisualizerBarProps = SupportsVisualizerBarProps;
export type Supports_VisualizerCircularProps = SupportsVisualizerCircularProps;

// =========================================================
// GLOBAL VALIDATION =======================================
// =========================================================

// export const saveValidator = saveValidator_V4;

// =========================================================
// DEFAULTS ================================================
// =========================================================

// export const defaultSaveConfig = defaultSaveConfig_V4;
// export const defaultShape = defaultShape_V4;
// export const defaultParticleFlow = defaultParticleFlow_V4;
// export const defaultText = defaultText_V4;
// export const defaultTimerStraightBar = defaultTimerStraightBar_V4;
// export const defaultTimerStraightLinePoint = defaultTimerStraightLinePoint_V4;
// export const defaultVisualizerStraightBar = defaultVisualizerStraightBar_V4;
// export const defaultVisualizerStraightWave = defaultVisualizerStraightWave_V4;
// export const defaultVisualizerCircularBar = defaultVisualizerCircularBar_V4;

// export const defaultVisualObject = (type: VisualObject_Type) => {
//     switch (type) {
//         case "shape":
//             return defaultShape();
//         case "particle_flow":
//             return defaultParticleFlow();
//         case "text":
//             return defaultText();
//         case "timer_straight_bar":
//             return defaultTimerStraightBar();
//         case "timer_straight_line_point":
//             return defaultTimerStraightLinePoint();
//         case "visualizer_straight_bar":
//             return defaultVisualizerStraightBar();
//         case "visualizer_straight_wave":
//             return defaultVisualizerStraightWave();
//         case "visualizer_circular_bar":
//             return defaultVisualizerCircularBar();
//         default:
//             throw new Error("Unknown type " + type);
//     }
// }
