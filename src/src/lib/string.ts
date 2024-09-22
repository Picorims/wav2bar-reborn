/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (C) 2024  Picorims <picorims.contact@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
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

	const keywords = str.replaceAll(";","").split(' ');
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