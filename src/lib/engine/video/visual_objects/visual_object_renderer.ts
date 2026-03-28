/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type {
	Supports_BoxShadow,
	VisualObject,
	VisualObject_Type,
	VisualObjectInterface
} from '$lib/store/save_structure/save_latest';
import {
	BlurFilter,
	Color,
	Container,
	Filter,
	Graphics,
	GraphicsContext,
	MaskFilter,
	Rectangle,
} from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import type { Atlas } from '../atlas';
import { ColorOverlayFilter, OutlineFilter } from 'pixi-filters';
import { createInvertFillFilter } from '../invert_fill_filter';
import { clamp } from '$lib/math';

export interface VisualObjectRenderer<T extends VisualObject> {
	/**
	 * Updates the pixi container according to the current save state.
	 */
	update(obj: T, atlas: Atlas): void;
	getContainer(): Container;
	/**
	 * returns null if there is no tick unit
	 */
	getTickUnit(): TickUnit<unknown> | null;
}

export class PlaceHolderVisualObjectRenderer implements VisualObjectRenderer<VisualObject> {
	private container: Container;

	constructor() {
		this.container = new Container();
	}

	update() {
		// console.log("PlaceHolderVisualObjectRenderer.update() called");

		return this.container;
	}

	getContainer(): Container {
		// console.log("PlaceHolderVisualObjectRenderer.getContainer() called");

		return this.container;
	}

	getTickUnit(): null {
		return null;
	}
}

/**
 * Returns a base pixi Container for the given visual object.
 * Handles position, layer, rotation and size.
 *
 * The Container is configured with a centred rotation pivot,
 * positioned and rotated according to the visual object.
 *
 * @param obj - The visual object configuration containing
 * coordinates, size, layer, and rotation.
 */
export function mutateBaseVOContainer<T extends VisualObject_Type>(
	obj: VisualObjectInterface<T>,
	container: Container
): void {
	// see: https://pixijs.com/8.x/examples?example=container_transform_origin
	container.zIndex = obj.layer;
	container.x = obj.coordinates.x + obj.size.width / 2;
	container.y = obj.coordinates.y + obj.size.height / 2;
	// center the rotation pivot
	container.width = obj.size.width;
	container.height = obj.size.height;
	container.pivot.set(obj.size.width / 2, obj.size.height / 2);
	container.angle = obj.rotation;
}

/**
 * Apply box shadows to the given container based on the provided box shadow configurations.
 * A filtered Graphics object is created for each box shadow, which is rendered behind the main container,
 * and amended as a child to the container.
 * Those are returned to be updated as needed in a rendering loop.
 * @param container
 * @param boxShadows
 * @returns
 */
export function applyBoxShadows<T extends VisualObject & Supports_BoxShadow>(
	container: Container,
	obj: T,
	graphicsContext: GraphicsContext,
	filterMask?: MaskFilter
): Graphics[] {
	const boxShadows = obj.box_shadows;
	if (boxShadows.length === 0) {
		return [];
	}

	const width = obj.size.width;
	const height = obj.size.height;

	const graphicsArray: Graphics[] = [];

	for (const shadow of boxShadows) {
		const baseGraphics = new Graphics({
			zIndex: shadow.inset ? 2 : 0, // in front of : behind
			width: width + shadow.blur_radius * 2 + shadow.spread_radius * 2,
			height: height + shadow.blur_radius * 2 + shadow.spread_radius * 2,
			context: graphicsContext
		});
		
		baseGraphics.filterArea = new Rectangle(
			-shadow.blur_radius - shadow.spread_radius,
			-shadow.blur_radius - shadow.spread_radius,
			width + (shadow.blur_radius + shadow.spread_radius) * 2,
			height + (shadow.blur_radius + shadow.spread_radius) * 2
		);

		const filters: Filter[] = [
			new ColorOverlayFilter({
				color: shadow.color
			}),
			new OutlineFilter({
				color: shadow.color,
				thickness: shadow.spread_radius,
				quality: 1
			}),
			new BlurFilter({
				strength: shadow.blur_radius,
				quality: 5,
				padding: shadow.blur_radius * 2 + shadow.spread_radius * 2
			})
		];

		if (shadow.inset) {
			filters.unshift(createInvertFillFilter(new Color(shadow.color)));
		}

		if (typeof filterMask !== 'undefined') {
			filters.unshift(filterMask);
			if (shadow.inset) {
				filters.push(filterMask);
			}
		}

		baseGraphics.filters = filters;
		container.addChild(baseGraphics);
		baseGraphics.x = shadow.offset.x;
		baseGraphics.y = shadow.offset.y;
		graphicsArray.push(baseGraphics);

		if (shadow.inset) {
			const maskGraphics = new Graphics(graphicsContext);
			baseGraphics.mask = maskGraphics;
			container.addChild(maskGraphics);
		}
	}

	return graphicsArray;
}


// https://spencermortensen.com/articles/bezier-circle/
const ARC_APPROX_BEZIER_DIST = 0.55342925736;

/**
 * Creates a CSS-like border-radius. Contrary to CSS, if the radiuses length outweight the dimensions,
 * Both will be evenly reduced, without accounting for unit or the other corner radius value.
 * Thus, 50px everywhere on a 100x20 rectangle will produce an ellipse instead of a capsule shape.
 * @param graphics 
 * @param x 
 * @param y 
 * @param w 
 * @param h 
 * @param radiuses 
 */
export function borderRadiusRect(graphics: GraphicsContext | Graphics, x: number, y: number, w: number, h: number, radiuses: { unit: 'px' | 'percent'; value: number }[]) {
	if (radiuses.length !== 8) {
		throw new Error('borderRadiusRect requires an array of 8 radius values');
	}
	const factors = [h, w, w, h, h, w, w, h];
	const d = ARC_APPROX_BEZIER_DIST;
	const id = 1 - d;
	const radiusesPx = radiuses.map(({ unit, value }, i) =>
		unit === 'px' ? value : (value / 100) * factors[i]
	);
	const r = radiusesPx;

	// clamp between 0 and width/height
	for (let i = 0; i < 8; i++) {
		r[i] = clamp(r[i], 0, factors[i]);
	}

	// avoid overlaps
	if (r[0] + r[7] > h) {
		const gap = r[0] + r[7] - h;
		r[0] -= Math.ceil(gap / 2);
		r[7] -= Math.floor(gap / 2);
	}
	if (r[1] + r[2] > w) {
		const gap = r[1] + r[2] - w;
		r[1] -= Math.ceil(gap / 2);
		r[2] -= Math.floor(gap / 2);
	}
	if (r[3] + r[4] > h) {
		const gap = r[3] + r[4] - h;
		r[3] -= Math.ceil(gap / 2);
		r[4] -= Math.floor(gap / 2);
	}
	if (r[5] + r[6] > w) {
		const gap = r[5] + r[6] - w;
		r[5] -= Math.ceil(gap / 2);
		r[6] -= Math.floor(gap / 2);
	}

	graphics
		.moveTo(x, y + radiusesPx[0])
		.bezierCurveTo(x, y + id * r[0], x + id * r[1], y, x + r[1], y)
		.lineTo(x + w - r[2], y)
		.bezierCurveTo(x + w - id * r[2], y, x + w, y + id * r[3], x + w, y + r[3])
		.lineTo(x + w, y + h - r[4])
		.bezierCurveTo(x + w, y + h - id * r[4], x + w - id * r[5], y + h, x + w - r[5], y + h)
		.lineTo(x + r[6], y + h)
		.bezierCurveTo(x + id * r[6], y + h, x, y + h - id * r[7], x, y + h - r[7])
		.closePath();
}
