/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { UUIDv4 } from '$lib/types/common_types';
import { Assets, Container, FillGradient, Graphics, Texture } from 'pixi.js';
import { mutateBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { SaveVO_ImageShape } from '$lib/store/save_structure/save_latest';
import type { Atlas } from '../atlas';
import { extractErrorMessage } from '$lib/string';

export class VO_ImageShape implements VisualObjectRenderer<SaveVO_ImageShape> {
	private saveId: UUIDv4;
	private container: Container;
	private texture: Texture | null = null;
	private caching: boolean = false;
	private currentType: SaveVO_ImageShape['background']['type'] | null = null;
	private backgroundContent: string | null = null;

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
	}

	getTickUnit() {
		return null;
	}

	update(obj: SaveVO_ImageShape, atlas: Atlas) {
		const imageBackgroundDefined: boolean =
			obj.background.type === 'image' && obj.background.last_image !== '';
		const shouldCreateImageCache: boolean =
			this.texture === null && !this.caching && imageBackgroundDefined;
		const shouldUpdateImageCache: boolean =
			!this.caching &&
			imageBackgroundDefined &&
			(this.currentType !== 'image' || this.backgroundContent !== obj.background.last_image);
		if (shouldCreateImageCache || shouldUpdateImageCache) {
			this.cacheTexture(obj, obj.background.last_image, atlas);
			this.currentType = 'image';
			this.backgroundContent = obj.background.last_image;
		}

		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);
		const width = obj.size.width;
		const height = obj.size.height;

		const graphics = new Graphics({
			width,
			height
		});
		graphics.rect(0, 0, width, height);

		if (obj.background.type === 'color') {
			if (obj.background.last_color === '') {
				graphics.fill(0xffffff); // Fallback to white if no color is defined
			} else {
				graphics.fill(obj.background.last_color);
			}
		} else if (obj.background.type === 'image') {
			if (this.texture) {
				graphics.fill(this.texture);
			} else {
				graphics.fill(0xffffff); // Fallback to white if texture is not ready
			}
		} else if (obj.background.type === 'gradient') {
			let gradient: FillGradient | null = null;

			if (obj.background.last_gradient.type === 'linear') {
				gradient = new FillGradient({
					type: 'linear',
					start: {
						x: (obj.background.last_gradient.start_point?.x ?? 0) * width,
						y: (obj.background.last_gradient.start_point?.y ?? 0) * height
					},
					end: {
						x: (obj.background.last_gradient.end_point?.x ?? 0) * width,
						y: (obj.background.last_gradient.end_point?.y ?? 1) * height
					},
					colorStops: obj.background.last_gradient.color_stops,
					textureSpace: 'global' // local space broken
				});
			} else if (obj.background.last_gradient.type === 'radial') {
				gradient = new FillGradient({
					type: 'radial',
					center: obj.background.last_gradient.start_point,
					outerCenter: obj.background.last_gradient.end_point,
					colorStops: obj.background.last_gradient.color_stops
				});
			}
			if (gradient === null) {
				throw new Error('Invalid gradient type (image shape renderer - update)');
			}
			graphics.fill(gradient);
		}

		this.container.addChild(graphics);

		return this.container;
	}
	getContainer(): Container {
		return this.container;
	}

	private async cacheTexture(obj: SaveVO_ImageShape, path: string, atlas: Atlas) {
		this.caching = true;
		try {
			const imageURL = await atlas.getImageURL(path, this.saveId);
			const texture = await Assets.load<Texture>(imageURL);
			this.texture = texture;
			// Trigger texture update on the renderer.
			// Do so before disabling caching to avoid potential multiple updates
			// or unwanted infinite loops.
			this.update(obj, atlas);
		} catch (error) {
			console.error(`Failed to load texture for path "${path}": ${extractErrorMessage(error)}`);
		} finally {
			this.caching = false;
		}
	}
}
