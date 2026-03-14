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
			const gradient = this.parseCSSGradient(obj.background.last_gradient);
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

	/**
	 * Transforms a (basic) CSS gradient string into a Pixi.js FillGradient object.
	 * This is a workaround until CSS syntax is deprecated.
	 * @param gradient
	 */
	private parseCSSGradient(gradient: string): FillGradient {
		const defaultGradient: FillGradient = new FillGradient({
			type: 'linear',
			colorStops: [
				{ offset: 0, color: 'white' },
				{ offset: 1, color: 'black' }
			]
		});

		let type: FillGradient['type'] = 'linear';
		const paramsStart = gradient.indexOf('(') + 1;
		const paramsEnd = gradient.lastIndexOf(')');
		let subString = gradient.substring(paramsStart, paramsEnd);
		if (subString.includes('linear-gradient') || subString.includes('radial-gradient')) {
			// multiple gradients defined, not supported
			console.warn(
				'CSS gradient: Multiple gradients defined in one string are not supported. Only the first gradient will be used.'
			);
			return defaultGradient;
		}
		if (subString.includes('rgb')) {
			// convert all rgba colors to hex format
			const rgbRegex = /rgba?\(\d+, ?\d+, ?\d+(, ?\d+(\.\d+)?)?\)/g;
			const matches = subString.matchAll(rgbRegex);
			for (const match of matches) {
				const rgbString = match[0];
				const rgbaMatch = rgbString.match(/rgba?\((\d+), ?(\d+), ?(\d+)(, ?(\d+(\.\d+)?))?\)/);
				if (rgbaMatch) {
					const r = parseInt(rgbaMatch[1]);
					const g = parseInt(rgbaMatch[2]);
					const b = parseInt(rgbaMatch[3]);
					const a = rgbaMatch[5] ? parseFloat(rgbaMatch[5]) : 1;
					const rgbHex: string = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
					const alphaHex: string =
						a < 1
							? Math.round(a * 255)
									.toString(16)
									.padStart(2, '0')
							: '';
					const hexColor = `#${rgbHex}${alphaHex}`;
					console.warn(
						`CSS gradient: RGB/RGBA color "${rgbString}" converted to hex format "${hexColor}". Only hex colors are supported in gradients.`
					);
					subString = subString.replace(rgbString, hexColor);
				}
			}
		}
		if (subString.includes('px')) {
			// color stops defined with position in px, not supported
			console.warn('CSS gradient: Color stops defined with position in px are not supported.');
			return defaultGradient;
		}
		const params = subString.split(',').map((param) => param.trim());

		if (gradient.startsWith('linear-gradient(')) {
			type = 'linear';
			let start: { x: number; y: number } | undefined = undefined;
			let end: { x: number; y: number } | undefined = undefined;
			if (params[0].includes('to ')) {
				const direction = params[0].replace('to ', '');
				if (direction === 'right') {
					start = { x: 0, y: 0 };
					end = { x: 1, y: 0 };
				} else if (direction === 'left') {
					start = { x: 1, y: 0 };
					end = { x: 0, y: 0 };
				} else if (direction === 'bottom') {
					start = { x: 0, y: 0 };
					end = { x: 0, y: 1 };
				} else if (direction === 'top') {
					start = { x: 0, y: 1 };
					end = { x: 0, y: 0 };
				} else if (direction === 'top right') {
					start = { x: 0, y: 1 };
					end = { x: 1, y: 0 };
				} else if (direction === 'top left') {
					start = { x: 1, y: 1 };
					end = { x: 0, y: 0 };
				} else if (direction === 'bottom right') {
					start = { x: 0, y: 0 };
					end = { x: 1, y: 1 };
				} else if (direction === 'bottom left') {
					start = { x: 1, y: 0 };
					end = { x: 0, y: 1 };
				} else {
					console.warn(`CSS gradient: Unsupported linear gradient direction "${direction}".`);
					return defaultGradient; // unsupported direction
				}
			} else if (params[0].includes('deg')) {
				const angle = parseFloat(params[0].replace('deg', '')) - 90; // adjust angle to match CSS gradient direction
				const radians = (angle % 360) * (Math.PI / 180);
				start = {
					x: 0.5 - Math.cos(radians) / 2,
					y: 0.5 - Math.sin(radians) / 2
				};
				end = {
					x: 0.5 + Math.cos(radians) / 2,
					y: 0.5 + Math.sin(radians) / 2
				};
			} else {
				console.warn(
					"CSS gradient: Unsupported linear gradient syntax. Only 'to direction' and 'angle in deg' are supported."
				);
				return defaultGradient; // unsupported linear gradient syntax
			}

			const colorStops = [];
			for (let i = 1; i < params.length; i++) {
				const [color, offset] = params[i].split(' ').map((part) => part.trim());
				if (!color || !offset) {
					console.warn(
						`CSS gradient: Unsupported color stop syntax. Color stops should be defined as 'color offset%' (got: ${params[i]}).`
					);
					return defaultGradient; // unsupported color stop syntax
				}
				const offsetValue = parseFloat(offset.replace('%', '')) / 100;
				colorStops.push({ offset: offsetValue, color });
			}

			return new FillGradient({
				type,
				start,
				end,
				colorStops
			});
		} else if (gradient.startsWith('radial-gradient(')) {
			type = 'radial';
			let center: { x: number; y: number } | undefined = undefined;
			if (params[0].includes('ellipse') || params[0].includes('circle')) {
				console.warn(
					"CSS gradient: using 'ellipse' or 'circle' syntax in radial gradients is not supported. Only position-based syntax is supported."
				);
				// shape defined, not supported
				return defaultGradient;
			}
			if (params[0].includes('at ')) {
				const position = params[0].replace('at ', '');
				if (position === 'center') {
					center = { x: 0.5, y: 0.5 };
				} else if (position.match(/^\d+% \d+%$/)) {
					const [x, y] = position.split(' ').map((part) => parseFloat(part.replace('%', '')) / 100);
					center = { x, y };
				} else {
					console.warn(
						`CSS gradient: Unsupported radial gradient position "${position}". Only "center" and "x% y%" formats are supported.`
					);
					return defaultGradient; // unsupported position
				}
			} else {
				console.warn(
					'CSS gradient: Unsupported radial gradient syntax. Only position-based syntax is supported.'
				);
				return defaultGradient; // unsupported radial gradient syntax
			}

			const colorStops = [];
			for (let i = 1; i < params.length; i++) {
				const [color, offset] = params[i].split(' ').map((part) => part.trim());
				if (!color || !offset) {
					console.warn(
						`CSS gradient: Unsupported color stop syntax. Color stops should be defined as 'color offset%' (got: ${params[i]}).`
					);
					return defaultGradient; // unsupported color stop syntax
				}
				const offsetValue = parseFloat(offset.replace('%', '')) / 100;
				colorStops.push({ offset: offsetValue, color });
			}

			return new FillGradient({
				type,
				center,
				colorStops
			});
		} else {
			console.warn(
				'CSS gradient: Unsupported gradient type. Only linear-gradient and radial-gradient are supported.'
			);
			return defaultGradient;
		}
	}
}
