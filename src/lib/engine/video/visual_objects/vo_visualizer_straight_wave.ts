/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { SaveVO_VisualizerStraightWave } from '$lib/store/save_structure/save_latest';
import { Container, Graphics } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import { getBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import { AudioSpectrumProcessor } from '../tick_units/audio_spectrum_processor';
import { Vec2 } from '$lib/math';

const DRAW_DEBUG = false;
const DIV_BY_ZERO_SAFEGUARD = 0.0001;
const SPECTRUM_VALUE_RESOLUTION = 65_536;

export class VO_VisualizerStraightWave
	implements VisualObjectRenderer<SaveVO_VisualizerStraightWave>
{
	private _saveId: UUIDv4;
	private _container: Container;
	private _graphics: Graphics;
	private _debugGraphics: Graphics;
	private _tickUnit: AudioSpectrumProcessor;
	private _spectrum: Uint16Array;
	private _pointsCount: number = 1;
	private _width: number = 1;
	private _height: number = 1;
	private _color: string = '#FFFFFF';

	constructor(saveId: UUIDv4) {
		this._saveId = saveId;
		this._container = new Container();
		this._graphics = new Graphics();
		this._debugGraphics = new Graphics();
		this._tickUnit = new AudioSpectrumProcessor();
		this._spectrum = new Uint16Array(0);
		this._tickUnit.subscribe(([spectrum]) => {
			this._spectrum = spectrum;
			this._render(this._graphics, this._debugGraphics);
		});
	}
	update(obj: SaveVO_VisualizerStraightWave): Container {
		this._tickUnit.setMapping({
			mappedLength: obj.visualizer_points_count,
			minPercent: (obj.visualizer_analyzer_range[0] / 1024) * 100,
			maxPercent: (obj.visualizer_analyzer_range[1] / 1024) * 100
		});
		this._tickUnit.setSmoothingParams({
			type: obj.visualization_smoothing_type,
			factor: obj.visualization_smoothing_factor
		});

		this._pointsCount = obj.visualizer_points_count;
		this._width = obj.size.width;
		this._height = obj.size.height;
		this._color = obj.color;

		const container = getBaseVOContainer(obj);

		const graphics = new Graphics();
		const debugGraphics = new Graphics();
		this._render(graphics, debugGraphics);
		container.addChild(graphics);
		if (DRAW_DEBUG) {
			container.addChild(debugGraphics);
		}

		this._container = container;
		this._graphics = graphics;
		this._debugGraphics = debugGraphics;
		return this._container;
	}
	private _render(graphics: Graphics, debugGraphics: Graphics): void {
		if (this._spectrum.length === 0) {
			return;
		}
		if (this._pointsCount !== this._spectrum.length) {
			// should not happen if mapping is set correctly
			console.warn('Points count does not match spectrum length');
		}
		graphics.clear();
		if (DRAW_DEBUG) {
			debugGraphics.clear();
		}
		const pointsCount = this._pointsCount;
		const containerWidth = this._width;
		const containerHeight = this._height;

		const step = containerWidth / Math.max(pointsCount - 1, 1);

		const points: { cpPrev: Vec2; cpNext: Vec2; point: Vec2 }[] = [];

		// compute points and control points
		for (let i = 0; i < pointsCount; i++) {
			const magnitude = this._spectrum[i] / SPECTRUM_VALUE_RESOLUTION; // Normalize to [0, 1]
			const barHeight = magnitude * containerHeight;
			const x = i * step;
			const y = containerHeight - barHeight;

			// future: if mode is line:
			// graphics.lineTo(x, y);

			// doing a spline interpolation with bezier curves for smoothness
			// see: https://scaledinnovation.com/analytics/splines/aboutSplines.html
			// control points are aligned on the vector going from previous to next point,
			// translated to cross the current point.

			// assuming an upward wave:
			// first control point is to the right of the previous point
			// second control point is to the left of the current point

			const prevIndex = Math.max(i - 1, 0);
			const nextIndex = Math.min(i + 1, pointsCount - 1);

			const prevX = prevIndex * step;
			const prevMagnitude = this._spectrum[prevIndex] / SPECTRUM_VALUE_RESOLUTION;
			const prevBarHeight = prevMagnitude * containerHeight;
			const prevY = containerHeight - prevBarHeight;

			const nextX = nextIndex * step;
			const nextMagnitude = this._spectrum[nextIndex] / SPECTRUM_VALUE_RESOLUTION;
			const nextBarHeight = nextMagnitude * containerHeight;
			const nextY = containerHeight - nextBarHeight;

			// how far the control points are from the current point along the direction vector
			// A value between 0 and 1 is recommended, though there is no upper limit.
			// 0 will produce straight lines, 1 will produce very curvy lines (possibly too stretched).
			const FACTOR = 0.5;

			const from = new Vec2(prevX, prevY);
			const to = new Vec2(nextX, nextY);
			const current = new Vec2(x, y);
			const fromToVector = to.sub(from);
			const distancePrev = current.sub(from).length;
			const distanceNext = to.sub(current).length;
			const fromScalingFactor =
				(FACTOR * distancePrev) / Math.max(distancePrev + distanceNext, DIV_BY_ZERO_SAFEGUARD);
			const toScalingFactor =
				(FACTOR * distanceNext) / Math.max(distancePrev + distanceNext, DIV_BY_ZERO_SAFEGUARD);
			const cp1 = current.sub(fromToVector.scale(fromScalingFactor));
			const cp2 = current.add(fromToVector.scale(toScalingFactor));

			points.push({ cpPrev: cp1, cpNext: cp2, point: current });
		}

		// same computation for the move as inside the loop for i=0
		graphics.moveTo(
			0,
			containerHeight - (this._spectrum[0] / SPECTRUM_VALUE_RESOLUTION) * containerHeight
		);
		if (DRAW_DEBUG) {
			debugGraphics.moveTo(
				0,
				containerHeight - (this._spectrum[0] / SPECTRUM_VALUE_RESOLUTION) * containerHeight
			);
		}

		for (let i = 0; i < pointsCount; i++) {
			if (i === 0) {
				const pos = points[i].point;
				graphics.lineTo(pos.x, pos.y);
			} else {
				const cp1 = points[i - 1].cpNext;
				const cp2 = points[i].cpPrev;
				const pos = points[i].point;

				graphics.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, pos.x, pos.y);

				if (DRAW_DEBUG) {
					// draw control points as three lines
					debugGraphics.setStrokeStyle({
						width: 1,
						color: i % 2 === 0 ? 0xff0000 : 0x00ff00
					});
					debugGraphics.lineTo(cp1.x, cp1.y);
					debugGraphics.lineTo(cp2.x, cp2.y);
					debugGraphics.lineTo(pos.x, pos.y);
					debugGraphics.stroke();
				}
			}
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
