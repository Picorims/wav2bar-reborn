/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type {
	Text,
	VisualizerStraightBar,
	SupportsBorderRadius,
	SupportsBackground,
	SupportsBorderThickness,
	SupportsBoxShadows,
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
	ParticleFlow,
	Shape
} from '$lib/types/schemas/save_v5';
import type { Wav2BarSaveV5 } from '$lib/types/schemas/save_v5';
import {
	ARCHIVE_STRUCTURE_V5,
	EXTENSION_V5,
	validateSaveV5,
	validateSaveV5VisualObject,
	visualObject_V5_types
} from './save_v5';

export const CURRENT_SAVE_VERSION = 5;
export const MINIMUM_SAVE_VERSION = 4;
export const EXTENSION = EXTENSION_V5;
export const ARCHIVE_STRUCTURE = ARCHIVE_STRUCTURE_V5;

export const validateSave = validateSaveV5;
export const validateSaveVisualObject = validateSaveV5VisualObject;

export type Save = Wav2BarSaveV5;
export type VisualObject = Wav2BarSaveV5['objects'][string];
export type SaveVO_Text = Text;
export type SaveVO_VisualizerStraightBar = VisualizerStraightBar;
export type SaveVO_VisualizerCircularBar = VisualizerCircularBar;
export type SaveVO_VisualizerStraightWave = VisualizerStraightWave;
export type SaveVO_TimerStraightLinePoint = TimerStraightLinePoint;
export type SaveVO_TimerStraightBar = TimerStraightBar;
export type SaveVO_ParticleFlow = ParticleFlow;
export type SaveVO_ImageShape = Shape;

// =========================================================
// PROPERTIES ==============================================
// =========================================================

export type VisualObject_Type = Save['objects'][string]['visual_object_type'];
export const visualObject_types = visualObject_V5_types;
export type VisualObjectInterface<T extends VisualObject_Type> = Save['objects'][string] & {
	visual_object_type: T;
};
export type Supports_BorderRadius = SupportsBorderRadius;
export type Supports_BoxShadow = SupportsBoxShadows;
export type Supports_Background = SupportsBackground;
export type Supports_ParticleProps = SupportsParticleProps;
export type Supports_Color = SupportsColor;
export type Supports_TextProps = SupportsTextProps;
export type Supports_BorderThickness = SupportsBorderThickness;
export type Supports_TimerInnerSpacing = SupportsTimerInnerSpacing;
export type Supports_VisualizerProps = SupportsVisualizerProps;
export type Supports_VisualizerBarProps = SupportsVisualizerBarProps;
export type Supports_VisualizerCircularProps = SupportsVisualizerCircularProps;
