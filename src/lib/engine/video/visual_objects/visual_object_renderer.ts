/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type {
	VisualObject,
	VisualObject_Type,
	VisualObjectInterface
} from '$lib/store/save_structure/save_latest';
import { Container } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import type { Atlas } from '../atlas';

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
