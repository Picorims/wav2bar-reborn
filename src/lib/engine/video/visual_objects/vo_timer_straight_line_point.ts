/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_TimerStraightLinePoint } from '$lib/store/save_structure/save_latest';
import { Container, Graphics, GraphicsContext } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import {
	applyBoxShadows,
	mutateBaseVOContainer,
	type VisualObjectRenderer
} from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import { TrackProgressTracker } from '../tick_units/track_progress_tracker';

export class VO_TimerStraightLinePoint
	implements VisualObjectRenderer<SaveVO_TimerStraightLinePoint>
{
	private saveId: UUIDv4;
	private container: Container;
	private graphicsContext: GraphicsContext;
	private shadowGraphics: Graphics[] = [];
	private tickUnit: TrackProgressTracker;
	private width: number = 1;
	private height: number = 1;
	private lineThickness: number = 1;
	private color: string = '#FFFFFF';
	private progressRatio: number = 0;

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
		this.graphicsContext = new GraphicsContext();
		this.tickUnit = new TrackProgressTracker();
		this.tickUnit.subscribe((ratio) => {
			this.progressRatio = ratio;
			this.render(this.graphicsContext);
		});
	}

	update(obj: SaveVO_TimerStraightLinePoint): void {
		this.width = obj.size.width;
		this.height = obj.size.height;
		this.color = obj.color;
		this.lineThickness = obj.border_thickness;

		for (const child of this.container.children) {
			child.destroy();
		}
		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);

		const graphics = new Graphics(this.graphicsContext);
		this.container.addChild(graphics);

		for (const sGraphics of this.shadowGraphics) {
			sGraphics.destroy();
		}
		this.shadowGraphics = applyBoxShadows(this.container, obj, this.graphicsContext);
		this.render(this.graphicsContext);
	}

	private render(graphics: GraphicsContext) {
		graphics.clear();

		// line
		const lineX = 0;
		const lineY = this.height / 2 - this.lineThickness / 2;
		const lineWidth = this.width;
		const lineHeight = this.lineThickness;
		graphics.rect(lineX, lineY, lineWidth, lineHeight);

		// point (cannot go outside the container / graphics)
		const pointDiameter = this.height;
		const pointCenterX = this.progressRatio * (this.width - pointDiameter) + pointDiameter / 2;
		const pointCenterY = this.height / 2;
		graphics.circle(pointCenterX, pointCenterY, pointDiameter / 2);
		graphics.fill(this.color);
	}
	getContainer(): Container {
		return this.container;
	}
	getTickUnit() {
		return this.tickUnit as TickUnit<unknown>;
	}
}
