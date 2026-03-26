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
	Rectangle,
	Texture
} from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import type { Atlas } from '../atlas';
import { ColorOverlayFilter, OutlineFilter } from 'pixi-filters';
import { renderer } from '../renderer';
import { createInvertFillFilter } from '../invert_fill_filter';

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
	graphicsContext?: GraphicsContext
): Graphics[] {
	const boxShadows = obj.box_shadows;
	if (boxShadows.length === 0) {
		return [];
	}

	const width = obj.size.width;
	const height = obj.size.height;

	let containerSnapshot: Texture | null = null;
	if (typeof graphicsContext === 'undefined') {
		containerSnapshot = renderer.generateTexture(container, new Rectangle(0, 0, width, height));
	}
	const graphicsArray: Graphics[] = [];

	for (const shadow of boxShadows) {
		const baseGraphics = new Graphics({
			zIndex: shadow.inset ? 2 : 0, // in front of : behind
			width: width + shadow.blur_radius * 2 + shadow.spread_radius * 2,
			height: height + shadow.blur_radius * 2 + shadow.spread_radius * 2,
			context: graphicsContext
		});
		if (typeof graphicsContext === 'undefined') {
			baseGraphics.rect(0, 0, width, height);
			baseGraphics.fill({ texture: containerSnapshot });
		}
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

		baseGraphics.filters = filters;
		container.addChild(baseGraphics);
		baseGraphics.x = shadow.offset.x;
		baseGraphics.y = shadow.offset.y;
		graphicsArray.push(baseGraphics);

		if (shadow.inset) {
			const maskGraphics = new Graphics(graphicsContext);
			if (typeof graphicsContext === 'undefined') {
				maskGraphics.rect(0, 0, width, height);
				maskGraphics.fill({ texture: containerSnapshot });
			}
			baseGraphics.mask = maskGraphics;
			container.addChild(maskGraphics);
		}
	}

	if (containerSnapshot !== null) {
		containerSnapshot.destroy();
	}

	return graphicsArray;
}
