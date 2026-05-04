/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { version } from '$app/environment';
import { Log } from './log/logger';
import {
	CURRENT_SAVE_VERSION,
	MINIMUM_SAVE_VERSION,
	validateSave,
	type Save
} from './store/save_structure/save_latest';
import { validateSaveV4 } from './store/save_structure/save_v4';
import { validateSaveV5 } from './store/save_structure/save_v5';
import type { Wav2BarSaveV4 } from './types/schemas/save_v4';
import type {
	Shape as ShapeV5,
	Text as TextV5,
	VisualObject as VisualObjectV5,
	Wav2BarSaveV5
} from './types/schemas/save_v5';

interface ConversionResult<T extends Record<string, unknown> = Record<string, unknown>> {
	success: boolean;
	warnings: string[];
	errors: string[];
	convertedSave: T | null;
}

/**
 * Note: save is mutated in-place. Post-validation against schema is required
 * after each conversion step, but is not performed by the conversion.
 */
const convertTo: Record<number, (save: Record<string, unknown>) => ConversionResult> = {
	5: (save) => {
		const typedSave = save as unknown as Wav2BarSaveV4;
		const result: ConversionResult<Wav2BarSaveV5> = {
			success: false,
			warnings: [],
			errors: [],
			convertedSave: null
		};
		const objects = Object.keys(typedSave.objects);
		if (objects.length === 0) {
			result.success = true;
			result.convertedSave = typedSave as unknown as Wav2BarSaveV5;
			result.convertedSave.save_version = 5;
			result.convertedSave.software_version_used = version;
		} else {
			const convertedSave: Wav2BarSaveV5 = {
				...typedSave,
				save_version: 5,
				software_version_used: version,
				objects: {}
			};
			for (const objectId of objects) {
				const obj = typedSave.objects[objectId];

				if (obj.visual_object_type === 'shape') {
					const parsedBackgroundSize = parseBackgroundSizeV4(obj.background.size);
					const parsedGradientResult = parseCSSGradientV4(obj.background.last_gradient);
					result.warnings.push(...parsedGradientResult.warnings);
					const parsedBoxShadowResult = parseCSSBoxShadowV4(obj.box_shadow);
					result.warnings.push(...parsedBoxShadowResult.warnings);
					const parsedBorderRadiusResult = parseCSSBorderRadiusV4(obj.border_radius);
					result.warnings.push(...parsedBorderRadiusResult.warnings);

					const newObj: ShapeV5 = {
						visual_object_type: 'shape',
						svg_filter: obj.svg_filter,
						name: obj.name,
						layer: obj.layer,
						coordinates: obj.coordinates,
						rotation: obj.rotation,
						size: obj.size,
						background: {
							type: obj.background.type,
							last_color: obj.background.last_color,
							last_image: obj.background.last_image,
							last_gradient: parsedGradientResult.gradient,
							repeat: obj.background.repeat.replaceAll('-', '_') as ShapeV5['background']['repeat'],
							size: {
								type: parsedBackgroundSize.sizeType,
								percentage: {
									x: parsedBackgroundSize.sizeX,
									y: parsedBackgroundSize.sizeY
								}
							}
						},
						border_radius: parsedBorderRadiusResult.border_radius,
						box_shadows: parsedBoxShadowResult.box_shadows
					};

					convertedSave.objects[objectId] = newObj;
				} else if (obj.visual_object_type === 'text') {
					const parsedShadowResult = parseCSSBoxShadowV4(obj.text_shadow);
					result.warnings.push(...parsedShadowResult.warnings);

					const newObj: TextV5 = {
						visual_object_type: 'text',
						svg_filter: obj.svg_filter,
						name: obj.name,
						layer: obj.layer,
						coordinates: obj.coordinates,
						rotation: obj.rotation,
						size: obj.size,
						text_content: obj.text_content,
						color: obj.color,
						font_family: obj.font_family,
						font_size: obj.font_size,
						text_align: obj.text_align,
						text_decoration: obj.text_decoration,
						text_type: obj.text_type,
						text_shadows: parsedShadowResult.box_shadows
					};

					convertedSave.objects[objectId] = newObj;
				} else if (
					obj.visual_object_type === 'timer_straight_bar' ||
					obj.visual_object_type === 'timer_straight_line_point' ||
					obj.visual_object_type === 'visualizer_straight_bar' ||
					obj.visual_object_type === 'visualizer_circular_bar'
				) {
					const convertedCSSBoxShadowResult = parseCSSBoxShadowV4(obj.box_shadow);
					result.warnings.push(...convertedCSSBoxShadowResult.warnings);
					const convertedCSSBorderRadiusResult = parseCSSBorderRadiusV4(obj.border_radius);
					result.warnings.push(...convertedCSSBorderRadiusResult.warnings);

					const newObj: VisualObjectV5 = {
						...obj,
						box_shadows: convertedCSSBoxShadowResult.box_shadows,
						border_radius: convertedCSSBorderRadiusResult.border_radius
					};
					delete newObj.box_shadow;

					convertedSave.objects[objectId] = newObj as unknown as VisualObjectV5;
				} else {
					// no conversion needed.
					convertedSave.objects[objectId] = obj as unknown as VisualObjectV5;
				}
			}

			result.success = true;
			result.convertedSave = convertedSave;
		}
		return result;
	}
};

const validate: Record<number, (save: Record<string, unknown>) => boolean> = {
	4: validateSaveV4,
	5: validateSaveV5
};

export class SaveConverter {
	public static convert(
		save: { save_version: number } & Record<string, unknown>
	): ConversionResult {
		if (save.save_version === CURRENT_SAVE_VERSION) {
			// up to date, just validate
			const valid = validateSave(save);
			if (!valid) {
				return {
					success: false,
					warnings: [],
					errors: ['Save is not valid according to the latest schema.'].concat(
						validateSave.errors?.map((e) => `- ${e.instancePath} ${e.message}`) || []
					),
					convertedSave: null
				};
			}
			return {
				success: true,
				warnings: [],
				errors: [],
				convertedSave: save as Save
			};
		} else if (save.save_version < MINIMUM_SAVE_VERSION) {
			// too old, cannot convert
			return {
				success: false,
				warnings: [],
				errors: [
					`Failed to convert save: save version is too old. Expected minimum version is ${MINIMUM_SAVE_VERSION}, but got ${save.save_version}.`
				],
				convertedSave: null
			};
		} else if (save.save_version > CURRENT_SAVE_VERSION) {
			// too new, cannot convert
			return {
				success: false,
				warnings: [],
				errors: [
					`Failed to convert save: save version is too new. Expected current version is ${CURRENT_SAVE_VERSION}, but got ${save.save_version}.`
				],
				convertedSave: null
			};
		} else {
			const conversionResult: ConversionResult = {
				success: false,
				warnings: [],
				errors: [],
				convertedSave: null
			};

			let currentVersion = save.save_version;
			let currentSave: Record<string, unknown> = save;

			while (currentVersion < CURRENT_SAVE_VERSION) {
				const targetVersion = currentVersion + 1;
				const convertFunc = convertTo[targetVersion];
				if (!convertFunc) {
					conversionResult.errors.push(
						`No conversion function available for version ${currentVersion} to ${targetVersion}.`
					);
					break;
				}
				const result = convertFunc(currentSave);
				if (!result.success || result.convertedSave === null) {
					conversionResult.errors.push(...result.errors);
					conversionResult.warnings.push(...result.warnings);
					break;
				}

				const validateFunc = validate[targetVersion];
				if (!validateFunc) {
					conversionResult.errors.push(
						`No validation function available for version ${targetVersion}.`
					);
					break;
				}
				const valid = validateFunc(result.convertedSave);
				if (!valid) {
					conversionResult.errors.push(`Converted save for version ${targetVersion} is not valid.`);
					break;
				}

				conversionResult.warnings.push(...result.warnings);
				conversionResult.errors.push(...result.errors);
				currentSave = result.convertedSave;
				currentVersion = targetVersion;
			}

			return conversionResult;
		}
	}
}

/**
 * IMPORTED FROM LEGACY
 *
 * Parse a background size CSS property into an object with separate values.
 *
 * @param {*} bgnd_size
 * @return {Object} An object resuming the properties.
 */
export function parseBackgroundSizeV4(bgnd_size: string): {
	sizeType: 'contain' | 'cover' | 'percentage';
	sizeX: number;
	sizeY: number;
} {
	const backgroundSizeArray = bgnd_size.split(' ');
	const percentRegExp = new RegExp(/[0-9]+%/); //no g flag so it doesn't keep track of last index
	if (backgroundSizeArray[0] === 'contain') {
		return {
			sizeType: 'contain',
			sizeX: 100,
			sizeY: 100
		};
	} else if (backgroundSizeArray[0] === 'cover') {
		return {
			sizeType: 'cover',
			sizeX: 100,
			sizeY: 100
		};
	} else if (backgroundSizeArray.length === 1 && percentRegExp.test(backgroundSizeArray[0])) {
		return {
			sizeType: 'percentage',
			sizeX: parseFloat(backgroundSizeArray[0].replace('%', '')),
			sizeY: 100
		};
	} else if (
		backgroundSizeArray.length === 2 &&
		percentRegExp.test(backgroundSizeArray[0]) &&
		percentRegExp.test(backgroundSizeArray[1])
	) {
		return {
			sizeType: 'percentage',
			sizeX: parseFloat(backgroundSizeArray[0].replace('%', '')),
			sizeY: parseFloat(backgroundSizeArray[1].replace('%', ''))
		};
	} else {
		return {
			sizeType: 'cover',
			sizeX: 100,
			sizeY: 100
		};
	}
}

/**
 * Transforms a (basic) CSS gradient string into a Pixi.js FillGradient object.
 * This is a workaround until CSS syntax is deprecated.
 * @param gradient
 */
export function parseCSSGradientV4(gradient: string): {
	gradient: ShapeV5['background']['last_gradient'];
	warnings: string[];
} {
	const defaultGradient: ShapeV5['background']['last_gradient'] = {
		type: 'linear',
		color_stops: [
			{ offset: 0, color: '#ffffff' },
			{ offset: 1, color: '#000000' }
		]
	};

	const warnings: string[] = [];

	let type: ShapeV5['background']['last_gradient']['type'] = 'linear';
	const paramsStart = gradient.indexOf('(') + 1;
	const paramsEnd = gradient.lastIndexOf(')');
	let subString = gradient.substring(paramsStart, paramsEnd);
	if (subString.includes('linear-gradient') || subString.includes('radial-gradient')) {
		// multiple gradients defined, not supported
		const warning = 'CSS gradient: Multiple gradients defined in one string are not supported.';
		warnings.push(warning);
		Log.save.warn(warning);
		return { gradient: defaultGradient, warnings };
	}
	if (subString.includes('rgb')) {
		// convert all rgba colors to hex format
		subString = convertRGBAToHexV4(subString, warnings);
	}
	if (subString.includes('px')) {
		// color stops defined with position in px, not supported
		const warning = 'CSS gradient: Color stops defined with position in px are not supported.';
		warnings.push(warning);
		Log.save.warn(warning);
		return { gradient: defaultGradient, warnings };
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
				const warning = `CSS gradient: Unsupported linear gradient direction "${direction}".`;
				warnings.push(warning);
				Log.save.warn(warning);
				return { gradient: defaultGradient, warnings }; // unsupported direction
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
			const warning =
				"CSS gradient: Unsupported linear gradient syntax. Only 'to direction' and 'angle in deg' are supported.";
			warnings.push(warning);
			Log.save.warn(warning);
			return { gradient: defaultGradient, warnings }; // unsupported linear gradient syntax
		}

		const colorStops = [];
		for (let i = 1; i < params.length; i++) {
			const [color, offset] = params[i].split(' ').map((part) => part.trim());
			if (!color || !offset) {
				const warning = `CSS gradient: Unsupported color stop syntax. Color stops should be defined as 'color offset%' (got: ${params[i]}).`;
				warnings.push(warning);
				Log.save.warn(warning);
				return { gradient: defaultGradient, warnings }; // unsupported color stop syntax
			}
			const offsetValue = parseFloat(offset.replace('%', '')) / 100;
			colorStops.push({ offset: offsetValue, color });
		}

		if (colorStops.length < 2) {
			const warning = 'CSS gradient: At least two color stops are required.';
			warnings.push(warning);
			Log.save.warn(warning);
			return { gradient: defaultGradient, warnings }; // not enough color stops
		}

		return {
			gradient: {
				type,
				start_point: start,
				end_point: end,
				color_stops: colorStops as ShapeV5['background']['last_gradient']['color_stops']
			},
			warnings
		};
	} else if (gradient.startsWith('radial-gradient(')) {
		type = 'radial';
		let center: { x: number; y: number } | undefined = undefined;
		if (params[0].includes('ellipse') || params[0].includes('circle')) {
			const warnign =
				"CSS gradient: Using 'ellipse' or 'circle' syntax in radial gradients is not supported. Only position-based syntax is supported.";
			warnings.push(warnign);
			Log.save.warn(warnign);
			// shape defined, not supported
			return { gradient: defaultGradient, warnings };
		}

		if (params[0].includes('at ')) {
			const position = params[0].replace('at ', '');
			if (position === 'center') {
				center = { x: 0.5, y: 0.5 };
			} else if (position.match(/^\d+% \d+%$/)) {
				const [x, y] = position.split(' ').map((part) => parseFloat(part.replace('%', '')) / 100);
				center = { x, y };
			} else {
				const waring = `CSS gradient: Unsupported radial gradient position "${position}". Only "center" and "x% y%" formats are supported.`;
				warnings.push(waring);
				Log.save.warn(waring);
				return { gradient: defaultGradient, warnings }; // unsupported position
			}
		} else {
			// Possibly a color list only case. Let the loop deals with it.
			// It starts at 1, so we insert a dummy param.
			params.unshift('');
		}

		const colorStops = [];
		for (let i = 1; i < params.length; i++) {
			const [color, offset] = params[i].split(' ').map((part) => part.trim());
			if (!color || !offset) {
				const warning = `CSS gradient: Unsupported color stop syntax. Color stops should be defined as 'color offset%' (got: ${params[i]}).`;
				warnings.push(warning);
				Log.save.warn(warning);
				return { gradient: defaultGradient, warnings }; // unsupported color stop syntax
			}
			const offsetValue = parseFloat(offset.replace('%', '')) / 100;
			colorStops.push({ offset: offsetValue, color });
		}

		return {
			gradient: {
				type,
				start_point: center,
				color_stops: colorStops as ShapeV5['background']['last_gradient']['color_stops']
			},
			warnings
		};
	} else {
		const warning =
			'CSS gradient: Unsupported gradient type. Only linear-gradient and radial-gradient are supported.';
		warnings.push(warning);
		Log.save.warn(warning);
		return { gradient: defaultGradient, warnings }; // unsupported gradient type
	}
}

export function parseCSSBoxShadowV4(boxShadow: string): {
	box_shadows: ShapeV5['box_shadows'];
	warnings: string[];
} {
	if (boxShadow === 'none' || boxShadow.trim() === '') {
		return {
			box_shadows: [],
			warnings: []
		};
	}
	const returnedBoxShadow: ShapeV5['box_shadows'] = [];
	const warnings: string[] = [];
	let shadowHexColorsOnly = boxShadow;
	if (boxShadow.includes('rgb')) {
		shadowHexColorsOnly = convertRGBAToHexV4(boxShadow, warnings);
	}

	const shadows = shadowHexColorsOnly.split(',').map((s) => s.trim());

	if (shadows.length === 0) {
		return {
			box_shadows: [],
			warnings
		};
	}

	for (const shadow of shadows) {
		const tokens = shadow.split(' ');
		const shadowObj: ShapeV5['box_shadows'][0] = {
			color: '#000000',
			offset: {
				x: 0,
				y: 0
			},
			blur_radius: 0,
			spread_radius: 0,
			inset: false
		};

		let position = 0; // offset-x, offset-y, blur-radius, spread-radius
		// allows a single "length" to be defined, even though CSS requires
		// at least offset-x and offset-y. offset-y defaults to 0.
		for (let i = 0; i < tokens.length; i++) {
			if (i > 5) {
				const warning = `CSS box-shadow: Too many tokens in box-shadow definition "${shadow}". Only "offset-x offset-y blur-radius spread-radius color inset" syntax is supported.`;
				warnings.push(warning);
				Log.save.warn(warning);
				break;
			}

			const token = tokens[i];
			// does not care if inset/outset is present multiple times.
			if (token === 'inset') {
				shadowObj.inset = true;
				continue;
			}
			if (token === 'outset') {
				shadowObj.inset = false;
				continue;
			}

			if (token === '0') {
				if (position === 0) {
					shadowObj.offset.x = 0;
				} else if (position === 1) {
					shadowObj.offset.y = 0;
				} else if (position === 2) {
					shadowObj.blur_radius = 0;
				} else if (position === 3) {
					shadowObj.spread_radius = 0;
				}
			} else if (token.endsWith('px')) {
				let value = parseFloat(token.replace('px', ''));
				if (isNaN(value)) {
					const warning = `CSS box-shadow: Invalid length value "${token}" in box-shadow definition "${shadow}". Only integers with "px" unit are supported. Defaulting to 0.`;
					warnings.push(warning);
					Log.save.warn(warning);
					value = 0;
				}
				if (position === 0) {
					shadowObj.offset.x = value;
				} else if (position === 1) {
					shadowObj.offset.y = value;
				} else if (position === 2) {
					shadowObj.blur_radius = value;
				} else if (position === 3) {
					shadowObj.spread_radius = value;
				}
			} else {
				const regexColor = /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8}))|[a-z]+$/;
				if (regexColor.test(token)) {
					shadowObj.color = token;
				} else {
					const warning = `CSS box-shadow: Unrecognized token "${token}" in box-shadow definition "${shadow}". Only "offset-x offset-y blur-radius spread-radius color inset" syntax is supported, with lengths defined as integers with "px" unit and colors defined as hex or named colors. (Unrecognized color.)`;
					warnings.push(warning);
					Log.save.warn(warning);
					continue;
				}
			}
			position++;
		}

		returnedBoxShadow.push(shadowObj);
	}

	return {
		box_shadows: returnedBoxShadow,
		warnings
	};
}

export function parseCSSBorderRadiusV4(borderRadius: string): {
	border_radius: ShapeV5['border_radius'];
	warnings: string[];
} {
	const defaultBorderRadius: ShapeV5['border_radius'] = [
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' }
	];
	const returnedBorderRadius: ShapeV5['border_radius'] = [
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' },
		{ value: 0, unit: 'px' }
	];
	const warnings = [];
	const baseRegex =
		/^(((\d+)(%|px)|0))( ((\d+)(%|px)|0)){0,3}( \/ (((\d+)(%|px)|0))( ((\d+)(%|px)|0)){0,3})?$/gm;
	let string = borderRadius;
	if (borderRadius.endsWith(';')) {
		string = borderRadius.replaceAll(';', '');
	}
	const match = baseRegex.exec(string);
	if (!match) {
		const warning = `CSS border-radius: Unsupported syntax "${borderRadius}". Border radius will be set to 0. Only "X unit" (1 to 4 times) and "X unit / Y unit" (1 to 4 times) syntaxes are supported, where X is a number and unit is either "px" or "%".`;
		warnings.push(warning);
		Log.save.warn(warning);
		return {
			border_radius: defaultBorderRadius,
			warnings
		};
	}

	const tokens = string.split(' ');
	const modifiedIndexesBeforeSlash = [
		[0, 1, 2, 3, 4, 5, 6, 7], // one value alone: all corners + both sides
		[2, 3, 6, 7], // two values: top-left & bottom-right, top-right & bottom-left
		[4, 5], // three values: top-left, top-right & bottom-left, bottom-right
		[6, 7] // four values: top-left, top-right, bottom-right, bottom-left
	];
	const modifiedIndexesAfterSlash = [
		// modifies vertically, so 0, 3, 4, 7. Same logic as above.
		[0, 3, 4, 7],
		[3, 7],
		[4],
		[7]
	];
	let position = 0;
	let afterSlash = false;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token === '/') {
			afterSlash = true;
			position = 0;
			continue;
		}
		let unit: 'px' | 'percent' = 'px';
		let value = 0;

		if (token !== '0') {
			if (token.includes('px')) {
				unit = 'px';
				value = parseFloat(token.replace('px', ''));
			} else if (token.includes('%')) {
				unit = 'percent';
				value = parseFloat(token.replace('%', ''));
			} else {
				const warning = `CSS border-radius: Unsupported token "${token}". Border radius will be set to 0. Only integers are supported, using either "px" or "%" as unit.`;
				warnings.push(warning);
				Log.save.warn(warning);
				unit = 'px';
				value = 0;
			}
		}

		const modifiedIndexes = afterSlash
			? modifiedIndexesAfterSlash[position]
			: modifiedIndexesBeforeSlash[position];
		for (const index of modifiedIndexes) {
			returnedBorderRadius[index] = { value, unit };
		}
		position++;
	}
	return {
		border_radius: returnedBorderRadius,
		warnings
	};
}

export function convertRGBAToHexV4(str: string, warnings: string[]): string {
	// convert all rgba colors to hex format
	const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*\d+(\.\d+)?\s*)?\)/g;
	const matches = str.matchAll(rgbRegex);

	let returnedStr = str;
	let count = 0;
	for (const match of matches) {
		const rgbString = match[0];
		const rgbaMatch = rgbString.match(
			/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+(\.\d+)?)?\s*)?\)/
		);
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
			const warning = `CSS rgb to hex conversion: RGB/RGBA color "${rgbString}" converted to hex format "${hexColor}".`;
			warnings.push(warning);
			Log.save.warn(warning);
			returnedStr = returnedStr.replace(rgbString, hexColor);
		} else {
			const warning = `CSS rgb to hex conversion: Failed to parse RGB/RGBA color from string "${rgbString}". Color will not be converted.`;
			warnings.push(warning);
			Log.save.warn(warning);
			continue;
		}
		count++;
	}
	if (count === 0) {
		const warning = 'CSS rgb to hex conversion: No RGB/RGBA color found to convert.';
		warnings.push(warning);
		Log.save.warn(warning);
		return str;
	}

	return returnedStr;
}
