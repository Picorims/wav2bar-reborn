/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { UUIDv4 } from '$lib/types/common_types';
import {
	Assets,
	Container,
	FillGradient,
	FillPattern,
	Graphics,
	GraphicsContext,
	MaskFilter,
	Matrix,
	Sprite,
	Texture
} from 'pixi.js';
import {
	applyBoxShadows,
	borderRadiusRect,
	mutateBaseVOContainer,
	type VisualObjectRenderer
} from './visual_object_renderer';
import type { SaveVO_ImageShape } from '$lib/store/save_structure/save_latest';
import type { Atlas } from '../atlas';
import { extractErrorMessage } from '$lib/string';
import { renderer } from '../renderer';

export class VO_ImageShape implements VisualObjectRenderer<SaveVO_ImageShape> {
	private saveId: UUIDv4;
	private container: Container;
	private graphicsContext: GraphicsContext;
	private shadowGraphics: Graphics[] = [];
	private texture: Texture | null = null;
	private caching: boolean = false;
	private currentType: SaveVO_ImageShape['background']['type'] | null = null;
	private backgroundContent: string | null = null;

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
		this.graphicsContext = new GraphicsContext();
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

		for (const child of this.container.children) {
			child.destroy();
		}
		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);
		const width = obj.size.width;
		const height = obj.size.height;

		const graphics = new Graphics({
			width,
			height,
			context: this.graphicsContext
		});
		graphics.zIndex = 1;

		this.graphicsContext.clear();
		const globalMask = new Graphics();
		borderRadiusRect(globalMask, 0, 0, width, height, obj.border_radius);
		globalMask.fill(0xffffff);

		if (obj.background.type === 'color') {
			borderRadiusRect(this.graphicsContext, 0, 0, width, height, obj.border_radius);
			if (obj.background.last_color === '') {
				this.graphicsContext.fill(0xffffff); // Fallback to white if no color is defined
			} else {
				this.graphicsContext.fill(obj.background.last_color);
			}
		} else if (obj.background.type === 'image') {
			if (this.texture) {
				const imageWidth = this.texture.width;
				const imageHeight = this.texture.height;
				const widthScale = width / imageWidth;
				const heightScale = height / imageHeight;
				const matrix = new Matrix();
				this.texture.source.style.update();
				if (obj.background.size.type === 'percentage') {
					const pattern = new FillPattern(this.texture);
					const percentageX = obj.background.size.percentage?.x ?? 100;
					const percentageY = obj.background.size.percentage?.y ?? 100;
					const scaleX = percentageX / 100;
					const scaleY = percentageY / 100;
					matrix.scale(scaleX, scaleY);
					pattern.transform = matrix;
					borderRadiusRect(this.graphicsContext, 0, 0, width, height, obj.border_radius);
					this.graphicsContext.fill(pattern);

					const mask = new Graphics();
					const maskWidth =
						obj.background.repeat === 'repeat' || obj.background.repeat === 'repeat_x'
							? width
							: width * scaleX;
					const maskHeight =
						obj.background.repeat === 'repeat' || obj.background.repeat === 'repeat_y'
							? height
							: height * scaleY;
					mask.rect(0, 0, maskWidth, maskHeight);
					mask.fill(0xffffff);
					graphics.addChild(mask);
					graphics.setMask({ mask });
				} else if (obj.background.size.type === 'cover') {
					if (widthScale > heightScale) {
						this.graphicsContext.rect(
							0,
							(height - imageHeight * widthScale) / 2,
							width,
							imageHeight * widthScale
						);
					} else {
						this.graphicsContext.rect(
							(width - imageWidth * heightScale) / 2,
							0,
							imageWidth * heightScale,
							height
						);
					}
					this.graphicsContext.fill(this.texture);
					graphics.addChild(globalMask);
					graphics.setMask({ mask: globalMask });
				} else if (obj.background.size.type === 'contain') {
					if (widthScale < heightScale) {
						this.graphicsContext.rect(
							0,
							(height - imageHeight * widthScale) / 2,
							width,
							imageHeight * widthScale
						);
					} else {
						this.graphicsContext.rect(
							(width - imageWidth * heightScale) / 2,
							0,
							imageWidth * heightScale,
							height
						);
					}
					this.graphicsContext.fill(this.texture);
					graphics.addChild(globalMask);
					graphics.setMask({ mask: globalMask });
				} else {
					throw new Error('Invalid background size type (image shape renderer - update)');
				}
			} else {
				borderRadiusRect(this.graphicsContext, 0, 0, width, height, obj.border_radius);
				this.graphicsContext.fill(0xffffff); // Fallback to white if texture is not ready
			}
		} else if (obj.background.type === 'gradient') {
			borderRadiusRect(this.graphicsContext, 0, 0, width, height, obj.border_radius);
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
			this.graphicsContext.fill(gradient);
		}

		this.container.addChild(graphics);
		applyBoxShadows(
			this.container,
			obj,
			this.graphicsContext,
			new MaskFilter({
				// TODO fix potential GPU memory leak
				sprite: new Sprite(renderer.generateTexture(globalMask)),
			})
		);

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
