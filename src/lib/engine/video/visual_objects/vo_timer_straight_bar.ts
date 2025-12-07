/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_TimerStraightBar } from "$lib/store/save_structure/save_latest";
import { Container, Graphics } from "pixi.js";
import type { TickUnit } from "../tick_units/tick_unit";
import { getBaseVOContainer, type VisualObjectRenderer } from "./visual_object_renderer";
import type { UUIDv4 } from "$lib/types/common_types";
import { TrackProgressTracker } from "../tick_units/track_progress_tracker";

export class VO_TimerStraightBar implements VisualObjectRenderer<SaveVO_TimerStraightBar> {
    private _saveId: UUIDv4;
    private _container: Container;
    private _graphics: Graphics;
    private _tickUnit: TrackProgressTracker;
    private _width: number = 1;
    private _height: number = 1;
    private _lineThickness: number = 1;
    private _innerSpacing: number = 0;
    private _color: string = "#FFFFFF";
    private _progressRatio: number = 0;


    constructor(saveId: UUIDv4) {
        this._saveId = saveId;
        this._container = new Container();
        this._graphics = new Graphics();
        this._tickUnit = new TrackProgressTracker();
        this._tickUnit.subscribe(ratio => {
            this._progressRatio = ratio;
            this._render(this._graphics);
        });

    }
    update(obj: SaveVO_TimerStraightBar): Container {
        this._width = obj.size.width;
        this._height = obj.size.height;
        this._color = obj.color;
        this._lineThickness = obj.border_thickness;
        this._innerSpacing = obj.timer_inner_spacing;

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
        
        // outer stroke bar (inset)
        const outerX = 0;
        const outerY = 0;
        const outerWidth = this._width;
        const outerHeight = this._height;
        graphics.rect(outerX, outerY, outerWidth, outerHeight);
        graphics.stroke({
            alignment: 1,
            cap: "square",
            join: "miter",
            color: this._color,
            width: this._lineThickness
        });

        // inner filled bar
        const innerX = this._lineThickness + this._innerSpacing;
        const innerY = this._lineThickness + this._innerSpacing;
        const innerWidth = (this._width - 2 * this._lineThickness - 2 * this._innerSpacing) * this._progressRatio;
        const innerHeight = this._height - 2 * this._lineThickness - 2 * this._innerSpacing;
        graphics.rect(innerX, innerY, innerWidth, innerHeight);
        graphics.fill(this._color);
    }
    getContainer(): Container {
        return this._container;
    }
    getTickUnit() {
        return this._tickUnit as TickUnit<unknown>;
    }
}