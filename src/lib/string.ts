/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

export const CHAR_DEGREE = String.fromCharCode(176);
export function keysUnderscoreToDash(obj: Record<string, string>): Record<string, string> {
	const newObj: Record<string, string> = {};
	for (const key in obj) {
		newObj[key.replaceAll('_', '-')] = obj[key];
	}
	return newObj;
}

export interface CSSTextShadow {
	offsetX: number;
	offsetY: number;
	blurRadius: number;
	color: string;
}
export function parseCSSTextShadow(str: string): CSSTextShadow {
	if (str === 'none' || str === '') {
		return {
			offsetX: 0,
			offsetY: 0,
			blurRadius: 0,
			color: 'black'
		};
	}

	const keywords = str.replaceAll(';', '').split(' ');
	const values: CSSTextShadow = {
		offsetX: 0,
		offsetY: 0,
		blurRadius: 0,
		color: 'black'
	};

	let pxKeywordIndex = 0;

	for (let i = 0; i < keywords.length; i++) {
		if (keywords[i].endsWith('px')) {
			if (pxKeywordIndex === 0) {
				values.offsetX = parseFloat(keywords[i].replace('px', ''));
			} else if (pxKeywordIndex === 1) {
				values.offsetY = parseFloat(keywords[i].replace('px', ''));
			} else if (pxKeywordIndex === 2) {
				values.blurRadius = parseFloat(keywords[i].replace('px', ''));
			}
			pxKeywordIndex++;
		} else {
			values.color = keywords[i];
		}
	}

	return values;
}

/**
 *
 * @param ms
 * @returns "MM:SS" formatted string
 */
export function msToMMSS(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	return `${withLeadingZero(minutes)}:${withLeadingZero(seconds % 60)}`;
}

/**
 *
 * @param n value to process
 * @returns value with a leading zero if it is less than 10
 */
export function withLeadingZero(n: number): string {
	return n < 10 ? '0' + n : n.toString();
}

export function filenameWithExtensionFromPath(path: string): string {
	const parts = path.split(/[/\\]/);
	return parts[parts.length - 1];
}

export const DEFAULT_ERROR_MESSAGE = 'An unknown error occurred';
export function extractErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	} else if (typeof error === 'string') {
		return error;
	} else {
		return DEFAULT_ERROR_MESSAGE;
	}
}