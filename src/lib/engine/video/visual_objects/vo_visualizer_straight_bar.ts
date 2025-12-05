/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_VisualizerStraightBar } from "$lib/store/save_structure/save_latest";
import { Container, Graphics } from "pixi.js";
import type { TickUnit } from "../tick_units/tick_unit";
import { getBaseVOContainer, type VisualObjectRenderer } from "./visual_object_renderer";
import type { UUIDv4 } from "$lib/types/common_types";
import { AudioSpectrumProcessor } from "../tick_units/audio_spectrum_processor";

const SPECTRUM_VALUE_RESOLUTION = 65_536;

export class VO_VisualizerStraightBar implements VisualObjectRenderer<SaveVO_VisualizerStraightBar> {
    private _saveId: UUIDv4;
    private _container: Container;
    private _graphics: Graphics;
    private _tickUnit: AudioSpectrumProcessor;
    private _spectrum: Uint16Array;
    private _barsCount: number = 1;
    private _barWidth: number = 1;
    private _width: number = 1;
    private _height: number = 1;
    private _color: string = "#FFFFFF";


    constructor(saveId: UUIDv4) {
        this._saveId = saveId;
        this._container = new Container();
        this._graphics = new Graphics();
        this._tickUnit = new AudioSpectrumProcessor();
        this._spectrum = new Uint16Array(0);
        this._tickUnit.subscribe(([spectrum]) => {
            this._spectrum = spectrum;
            this._render(this._graphics);
        });

    }
    update(obj: SaveVO_VisualizerStraightBar): Container {
        this._tickUnit.setMapping({
            mappedLength: obj.visualizer_points_count,
            minPercent: obj.visualizer_analyzer_range[0] / 1024 * 100,
            maxPercent: obj.visualizer_analyzer_range[1] / 1024 * 100
        });
        this._tickUnit.setSmoothingParams({
            type: obj.visualization_smoothing_type,
            factor: obj.visualization_smoothing_factor
        });

        this._barsCount = obj.visualizer_points_count;
        this._barWidth = obj.visualizer_bar_thickness;
        this._width = obj.size.width;
        this._height = obj.size.height;
        this._color = obj.color;

        const container = getBaseVOContainer(obj);

        const graphics = new Graphics();
        this._render(graphics);
        container.addChild(graphics);

        this._container = container;
        this._graphics = graphics;
        return this._container;
    }
    private _render(graphics: Graphics) {
        graphics.clear();
        const barsCount = this._barsCount;
        const barWidth = this._barWidth;
        const containerWidth = this._width;
        const containerHeight = this._height;

        const gap = (containerWidth - (barsCount * barWidth)) / Math.max(1, barsCount - 1);
        const step = barWidth + gap;

        for (let i = 0; i < barsCount; i++) {
            const spectrumIndex = Math.floor((i / barsCount) * this._spectrum.length);
            const magnitude = this._spectrum[spectrumIndex] / SPECTRUM_VALUE_RESOLUTION; // Normalize to [0, 1]
            const barHeight = magnitude * containerHeight;
            const x = i * step;
            const y = containerHeight - barHeight;
            const width = barWidth;
            const height = barHeight;
            graphics.rect(x, y, width, height);
        }
        graphics.fill(this._color);
    }
    getContainer(): Container {
        return this._container;
    }
    getTickUnit() {
        return this._tickUnit as TickUnit<unknown>;
    }

}