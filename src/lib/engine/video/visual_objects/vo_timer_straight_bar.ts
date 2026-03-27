/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_TimerStraightBar } from '$lib/store/save_structure/save_latest';
import { Container, Graphics, GraphicsContext } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import {
	applyBoxShadows,
	borderRadiusRect,
	mutateBaseVOContainer,
	type VisualObjectRenderer
} from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import { TrackProgressTracker } from '../tick_units/track_progress_tracker';

export class VO_TimerStraightBar implements VisualObjectRenderer<SaveVO_TimerStraightBar> {
	private saveId: UUIDv4;
	private container: Container;
	private graphicsContext: GraphicsContext;
	private shadowGraphics: Graphics[] = [];
	private tickUnit: TrackProgressTracker;
	private width: number = 1;
	private height: number = 1;
	private lineThickness: number = 1;
	private innerSpacing: number = 0;
	private color: string = '#FFFFFF';
	private progressRatio: number = 0;
	private borderRadius: SaveVO_TimerStraightBar["border_radius"] | null = null;

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

	update(obj: SaveVO_TimerStraightBar) {
		this.width = obj.size.width;
		this.height = obj.size.height;
		this.color = obj.color;
		this.lineThickness = obj.border_thickness;
		this.innerSpacing = obj.timer_inner_spacing;
		this.borderRadius = obj.border_radius;

		for (const child of this.container.children) {
			child.destroy();
		}
		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);

		const graphics = new Graphics(this.graphicsContext);
		graphics.zIndex = 1;
		this.container.addChild(graphics);

		for (const sGraphics of this.shadowGraphics) {
			sGraphics.destroy();
		}
		this.shadowGraphics = applyBoxShadows(this.container, obj, this.graphicsContext);
		this.render(this.graphicsContext);
	}

	private render(graphics: GraphicsContext) {
		graphics.clear();

		// outer stroke bar (inset)
		const outerX = 0;
		const outerY = 0;
		const outerWidth = this.width;
		const outerHeight = this.height;
		if (this.borderRadius !== null) {
			borderRadiusRect(graphics, outerX, outerY, outerWidth, outerHeight, this.borderRadius);
		} else {
			graphics.rect(outerX, outerY, outerWidth, outerHeight);
		}
		graphics.stroke({
			alignment: 1,
			cap: 'square',
			join: 'miter',
			color: this.color,
			width: this.lineThickness
		});

		// inner filled bar
		const innerX = this.lineThickness + this.innerSpacing;
		const innerY = this.lineThickness + this.innerSpacing;
		const innerWidth =
			(this.width - 2 * this.lineThickness - 2 * this.innerSpacing) * this.progressRatio;
		const innerHeight = this.height - 2 * this.lineThickness - 2 * this.innerSpacing;
		if (this.borderRadius !== null) {
			borderRadiusRect(graphics, innerX, innerY, innerWidth, innerHeight, this.borderRadius);
		} else {
			graphics.rect(innerX, innerY, innerWidth, innerHeight);
		}
		graphics.fill(this.color);
	}
	getContainer(): Container {
		return this.container;
	}
	getTickUnit() {
		return this.tickUnit as TickUnit<unknown>;
	}
}
