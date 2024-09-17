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

import { ARCHIVE_STRUCTURE_V4, defaultParticleFlow_V4, defaultSaveConfig_V4, defaultShape_V4, defaultText_V4, defaultTimerStraightBar_V4, defaultTimerStraightLinePoint_V4, defaultVisualizerCircularBar_V4, defaultVisualizerStraightBar_V4, defaultVisualizerStraightWave_V4, EXTENSION_V4, saveValidator_V4, visualObject_V4_types, type Save_V4, type VisualObjectInterface_V4, type VisualObject_V4_Type, type VisualObject_V4, type Supports_BorderRadius_V4, type Supports_BoxShadow_V4, type Supports_Background_V4, type Supports_ParticleProps_V4, type Supports_Color_V4, type Supports_TextProps_V4, type Supports_BorderThickness_V4, type Supports_TimerInnerSpacing_V4, type Supports_VisualizerProps_V4, type Supports_VisualizerBarProps_V4, type Supports_VisualizerCircularProps_V4 } from './save_v4';

export const EXTENSION = EXTENSION_V4;
export const ARCHIVE_STRUCTURE = ARCHIVE_STRUCTURE_V4;

export type Save = Save_V4;
export type VisualObject = VisualObject_V4;

// =========================================================
// PROPERTIES ==============================================
// =========================================================

export type VisualObject_Type = VisualObject_V4_Type;
export const visualObject_types = visualObject_V4_types;
export type VisualObjectInterface<T extends VisualObject_Type> = VisualObjectInterface_V4<T>;
export type Supports_BorderRadius = Supports_BorderRadius_V4;
export type Supports_BoxShadow = Supports_BoxShadow_V4;
export type Supports_Background = Supports_Background_V4;
export type Supports_ParticleProps = Supports_ParticleProps_V4;
export type Supports_Color = Supports_Color_V4;
export type Supports_TextProps = Supports_TextProps_V4;
export type Supports_BorderThickness = Supports_BorderThickness_V4;
export type Supports_TimerInnerSpacing = Supports_TimerInnerSpacing_V4;
export type Supports_VisualizerProps = Supports_VisualizerProps_V4;
export type Supports_VisualizerBarProps = Supports_VisualizerBarProps_V4;
export type Supports_VisualizerCircularProps = Supports_VisualizerCircularProps_V4;

// =========================================================
// GLOBAL VALIDATION =======================================
// =========================================================

export const saveValidator = saveValidator_V4;

// =========================================================
// DEFAULTS ================================================
// =========================================================

export const defaultSaveConfig = defaultSaveConfig_V4;
export const defaultShape = defaultShape_V4;
export const defaultParticleFlow = defaultParticleFlow_V4;
export const defaultText = defaultText_V4;
export const defaultTimerStraightBar = defaultTimerStraightBar_V4;
export const defaultTimerStraightLinePoint = defaultTimerStraightLinePoint_V4;
export const defaultVisualizerStraightBar = defaultVisualizerStraightBar_V4;
export const defaultVisualizerStraightWave = defaultVisualizerStraightWave_V4;
export const defaultVisualizerCircularBar = defaultVisualizerCircularBar_V4;

export const defaultVisualObject = (type: VisualObject_Type) => {
    switch (type) {
        case "shape":
            return defaultShape();
        case "particle_flow":
            return defaultParticleFlow();
        case "text":
            return defaultText();
        case "timer_straight_bar":
            return defaultTimerStraightBar();
        case "timer_straight_line_point":
            return defaultTimerStraightLinePoint();
        case "visualizer_straight_bar":
            return defaultVisualizerStraightBar();
        case "visualizer_straight_wave":
            return defaultVisualizerStraightWave();
        case "visualizer_circular_bar":
            return defaultVisualizerCircularBar();
        default:
            throw new Error("Unknown type " + type);
    }
}