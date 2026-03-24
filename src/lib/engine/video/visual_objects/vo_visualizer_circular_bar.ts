/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_VisualizerCircularBar } from '$lib/store/save_structure/save_latest';
import { Container, Graphics, GraphicsContext } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import { applyBoxShadows, mutateBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import { AudioSpectrumProcessor } from '../tick_units/audio_spectrum_processor';
import { Vec2 } from '$lib/math';

const SPECTRUM_VALUE_RESOLUTION = 65_536;

export class VO_VisualizerCircularBar
	implements VisualObjectRenderer<SaveVO_VisualizerCircularBar>
{
	private saveId: UUIDv4;
	private container: Container;
	private graphicsContext: GraphicsContext;
	private shadowGraphics: Graphics[] = [];
	private tickUnit: AudioSpectrumProcessor;
	private spectrum: Uint16Array;
	private barsCount: number = 1;
	private barWidth: number = 1;
	private width: number = 1;
	private height: number = 1;
	private color: string = '#FFFFFF';
	private radius: number = 1;

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
		this.graphicsContext = new GraphicsContext();
		this.tickUnit = new AudioSpectrumProcessor();
		this.spectrum = new Uint16Array(0);
		this.tickUnit.subscribe(([spectrum]) => {
			this.spectrum = spectrum;
			this.render(this.graphicsContext);
		});
	}

	update(obj: SaveVO_VisualizerCircularBar) {
		this.tickUnit.setMapping({
			mappedLength: obj.visualizer_points_count,
			minPercent: (obj.visualizer_analyzer_range[0] / 1024) * 100,
			maxPercent: (obj.visualizer_analyzer_range[1] / 1024) * 100
		});
		this.tickUnit.setSmoothingParams({
			type: obj.visualization_smoothing_type,
			factor: obj.visualization_smoothing_factor
		});

		this.barsCount = obj.visualizer_points_count;
		this.barWidth = obj.visualizer_bar_thickness;
		this.width = obj.size.width;
		this.height = obj.size.height;
		this.color = obj.color;
		this.radius = obj.visualizer_radius;

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
		const barsCount = this.barsCount;
		const barWidth = this.barWidth;
		const containerWidth = this.width;
		const containerHeight = this.height;

		const radiusMin = this.radius;
		const maxBarLength = Math.min(containerWidth, containerHeight) / 2 - radiusMin;
		const angleStep = (2 * Math.PI) / barsCount;
		const center = new Vec2(containerWidth / 2, containerHeight / 2);

		for (let i = 0; i < barsCount; i++) {
			const magnitude = this.spectrum[i] / SPECTRUM_VALUE_RESOLUTION; // Normalize to [0, 1]
			const barHeight = magnitude * maxBarLength;
			const direction = new Vec2(Math.cos(i * angleStep), Math.sin(i * angleStep)); // normalized
			// rotation is 90 degrees offset clockwise
			const directionTangent = new Vec2(-direction.y, direction.x); // normalized
			const p1 = center.add(direction.scale(radiusMin)).add(directionTangent.scale(-barWidth / 2));
			const p2 = p1.add(direction.scale(barHeight));
			const p3 = p2.add(directionTangent.scale(barWidth));
			const p4 = p3.add(direction.scale(-barHeight));

			graphics.moveTo(p1.x, p1.y);
			graphics.lineTo(p2.x, p2.y);
			graphics.lineTo(p3.x, p3.y);
			graphics.lineTo(p4.x, p4.y);
			graphics.closePath();
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
