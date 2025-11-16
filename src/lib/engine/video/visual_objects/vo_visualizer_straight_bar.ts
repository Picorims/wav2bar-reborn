/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_VisualizerStraightBar } from "$lib/store/save_structure/save_latest";
import type { VisualizerStraightBar } from "$lib/types/schemas/save_v4";
import { Container, Graphics } from "pixi.js";
import type { TickUnit } from "../tick_units/tick_unit";
import type { VisualObjectRenderer } from "./visual_object_renderer";
import type { UUIDv4 } from "$lib/types/common_types";
import { AudioSpectrumProcessor } from "../tick_units/audio_spectrum_processor";

export class VO_VisualizerStraightBar implements VisualObjectRenderer<SaveVO_VisualizerStraightBar> {
    private _saveId: UUIDv4;
	private _container: Container;
    private _graphics: Graphics;
    private _tickUnit: AudioSpectrumProcessor;
    private _spectrum: Uint8Array;
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
        this._spectrum = new Uint8Array(0);
		this._tickUnit.subscribe((spectrum) => {
            this._spectrum = spectrum;
            this._render(this._graphics);
		});

    }
    update(obj: VisualizerStraightBar): Container {
        this._barsCount = obj.visualizer_points_count;
        this._barWidth = obj.visualizer_bar_thickness;
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
        const barsCount = this._barsCount;
        const barWidth = this._barWidth;
        const width = this._width;
        const height = this._height;

        const gap = (width - (barsCount * barWidth)) / (barsCount - 1);
        const step = barWidth + gap;

        for (let i = 0; i < barsCount; i++) {
            const spectrumIndex = Math.floor((i / barsCount) * this._spectrum.length);
            const magnitude = this._spectrum[spectrumIndex] / 255; // Normalize to [0, 1]
            const barHeight = magnitude * height;
            const x1 = i * step
            const y1 = height - barHeight;
            const x2 = x1 + barWidth;
            const y2 = height;
            graphics.rect(x1, y1, x2, y2);
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