/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_TimerStraightLinePoint } from '$lib/store/save_structure/save_latest';
import { Container, Graphics } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import { getBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import { TrackProgressTracker } from '../tick_units/track_progress_tracker';

export class VO_TimerStraightLinePoint
	implements VisualObjectRenderer<SaveVO_TimerStraightLinePoint>
{
	private _saveId: UUIDv4;
	private _container: Container;
	private _graphics: Graphics;
	private _tickUnit: TrackProgressTracker;
	private _width: number = 1;
	private _height: number = 1;
	private _lineThickness: number = 1;
	private _color: string = '#FFFFFF';
	private _progressRatio: number = 0;

	constructor(saveId: UUIDv4) {
		this._saveId = saveId;
		this._container = new Container();
		this._graphics = new Graphics();
		this._tickUnit = new TrackProgressTracker();
		this._tickUnit.subscribe((ratio) => {
			this._progressRatio = ratio;
			this._render(this._graphics);
		});
	}
	update(obj: SaveVO_TimerStraightLinePoint): Container {
		this._width = obj.size.width;
		this._height = obj.size.height;
		this._color = obj.color;
		this._lineThickness = obj.border_thickness;

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

		// line
		const lineX = 0;
		const lineY = this._height / 2 - this._lineThickness / 2;
		const lineWidth = this._width;
		const lineHeight = this._lineThickness;
		graphics.rect(lineX, lineY, lineWidth, lineHeight);

		// point (cannot go outside the container / graphics)
		const pointDiameter = this._height;
		const pointCenterX = this._progressRatio * (this._width - pointDiameter) + pointDiameter / 2;
		const pointCenterY = this._height / 2;
		graphics.circle(pointCenterX, pointCenterY, pointDiameter / 2);
		graphics.fill(this._color);
	}
	getContainer(): Container {
		return this._container;
	}
	getTickUnit() {
		return this._tickUnit as TickUnit<unknown>;
	}
}
