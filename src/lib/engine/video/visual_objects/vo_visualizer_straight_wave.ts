/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_VisualizerStraightWave } from "$lib/store/save_structure/save_latest";
import { Container, Graphics } from "pixi.js";
import type { TickUnit } from "../tick_units/tick_unit";
import type { VisualObjectRenderer } from "./visual_object_renderer";
import type { UUIDv4 } from "$lib/types/common_types";
import { AudioSpectrumProcessor } from "../tick_units/audio_spectrum_processor";

export class VO_VisualizerStraightWave implements VisualObjectRenderer<SaveVO_VisualizerStraightWave> {
    private _saveId: UUIDv4;
    private _container: Container;
    private _graphics: Graphics;
    private _tickUnit: AudioSpectrumProcessor;
    private _spectrum: Uint8Array;
    private _pointsCount: number = 1;
    private _width: number = 1;
    private _height: number = 1;
    private _color: string = "#FFFFFF";


    constructor(saveId: UUIDv4) {
        this._saveId = saveId;
        this._container = new Container();
        this._graphics = new Graphics();
        this._tickUnit = new AudioSpectrumProcessor();
        this._spectrum = new Uint8Array(0);
        this._tickUnit.subscribe(([spectrum]) => {
            this._spectrum = spectrum;
            this._render(this._graphics);
        });

    }
    update(obj: SaveVO_VisualizerStraightWave): Container {
        this._tickUnit.setMapping({
            mappedLength: obj.visualizer_points_count,
            minPercent: obj.visualizer_analyzer_range[0] / 1024 * 100,
            maxPercent: obj.visualizer_analyzer_range[1] / 1024 * 100
        });
        this._tickUnit.setSmoothingParams({
            type: obj.visualization_smoothing_type,
            factor: obj.visualization_smoothing_factor
        });

        this._pointsCount = obj.visualizer_points_count;
        this._width = obj.size.width;
        this._height = obj.size.height;
        this._color = obj.color;

        const container = new Container({
            zIndex: obj.layer,
            x: obj.coordinates.x,
            y: obj.coordinates.y,
            angle: obj.rotation // angle is in degrees
        });

        const graphics = new Graphics();
        this._render(graphics);
        container.addChild(graphics);

        this._container = container;
        this._graphics = graphics;
        return this._container;
    }
    private _render(graphics: Graphics) {
        graphics.clear();
        const pointsCount = this._pointsCount;
        const containerWidth = this._width;
        const containerHeight = this._height;

        const step = containerWidth / Math.max(pointsCount, 1);

        // same computation for the move than inside the loop for i=0
        graphics.moveTo(0, containerHeight - (this._spectrum[0] / 255) * containerHeight);
        for (let i = 0; i < pointsCount; i++) {
            const spectrumIndex = Math.floor((i / pointsCount) * this._spectrum.length);
            const magnitude = this._spectrum[spectrumIndex] / 255; // Normalize to [0, 1]
            const barHeight = magnitude * containerHeight;
            const x = i * step;
            const y = containerHeight - barHeight;
            graphics.lineTo(x, y);
        }
        // draw floor (two points at the bottom left and bottom right)
        graphics.lineTo(containerWidth, containerHeight);
        graphics.lineTo(0, containerHeight);
        graphics.closePath();
        graphics.fill(this._color);
    }
    getContainer(): Container {
        return this._container;
    }
    getTickUnit() {
        return this._tickUnit as TickUnit<unknown>;
    }

}