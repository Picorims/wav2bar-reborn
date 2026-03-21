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
import { BlurFilter, Container, Graphics, Rectangle } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import type { Atlas } from '../atlas';
import { ColorOverlayFilter, OutlineFilter } from 'pixi-filters';
import { renderer } from '../renderer';

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



export function applyBoxShadows<T extends Supports_BoxShadow>(container: Container, boxShadows: T["box_shadows"]): void {
	if (boxShadows.length === 0) {
		return;
	}

	const containerSnapshot = renderer.generateTexture(container);

	for (const shadow of boxShadows) {
		const baseGraphics = new Graphics({
			zIndex: container.zIndex - 1, // Ensure shadows are rendered behind the main container
		});
		baseGraphics.rect(0, 0, container.width, container.height);
		baseGraphics.fill({texture: containerSnapshot});
		baseGraphics.filterArea = new Rectangle(
			-shadow.blur_radius - shadow.spread_radius,
			-shadow.blur_radius - shadow.spread_radius,
			container.width + (shadow.blur_radius + shadow.spread_radius) * 2,
			container.height + (shadow.blur_radius + shadow.spread_radius) * 2
		);
		baseGraphics.filters = [
			new ColorOverlayFilter({
				color: shadow.color,
			}),
			new OutlineFilter({
				color: shadow.color,
				thickness: shadow.spread_radius,
			}),
			new BlurFilter({
				strength: shadow.blur_radius,
				quality: 5,
				padding: shadow.blur_radius * 2 + shadow.spread_radius * 2,
			}),
		];
		container.addChild(baseGraphics);
		baseGraphics.x = shadow.offset.x;
		baseGraphics.y = shadow.offset.y;
	}
}