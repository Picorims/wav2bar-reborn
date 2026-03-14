/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_VisualizerStraightBar } from '$lib/store/save_structure/save_latest';
import { Container, Graphics } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import { mutateBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import { AudioSpectrumProcessor } from '../tick_units/audio_spectrum_processor';

const SPECTRUM_VALUE_RESOLUTION = 65_536;

export class VO_VisualizerStraightBar
	implements VisualObjectRenderer<SaveVO_VisualizerStraightBar>
{
	private saveId: UUIDv4;
	private container: Container;
	private graphics: Graphics;
	private tickUnit: AudioSpectrumProcessor;
	private spectrum: Uint16Array;
	private barsCount: number = 1;
	private barWidth: number = 1;
	private width: number = 1;
	private height: number = 1;
	private color: string = '#FFFFFF';

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
		this.graphics = new Graphics();
		this.tickUnit = new AudioSpectrumProcessor();
		this.spectrum = new Uint16Array(0);
		this.tickUnit.subscribe(([spectrum]) => {
			this.spectrum = spectrum;
			this.render(this.graphics);
		});
	}

	update(obj: SaveVO_VisualizerStraightBar) {
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

		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);

		const graphics = new Graphics();
		this.render(graphics);
		this.container.addChild(graphics);

		this.graphics = graphics;
	}

	private render(graphics: Graphics) {
		graphics.clear();
		const barsCount = this.barsCount;
		const barWidth = this.barWidth;
		const containerWidth = this.width;
		const containerHeight = this.height;

		const gap = (containerWidth - barsCount * barWidth) / Math.max(1, barsCount - 1);
		const step = barWidth + gap;

		for (let i = 0; i < barsCount; i++) {
			const spectrumIndex = Math.floor((i / barsCount) * this.spectrum.length);
			const magnitude = this.spectrum[spectrumIndex] / SPECTRUM_VALUE_RESOLUTION; // Normalize to [0, 1]
			const barHeight = magnitude * containerHeight;
			const x = i * step;
			const y = containerHeight - barHeight;
			const width = barWidth;
			const height = barHeight;
			graphics.rect(x, y, width, height);
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
