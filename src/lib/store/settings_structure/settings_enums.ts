/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

// see: https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums

export const ThemeOptions = {
	DEFAULT: 'DEFAULT',
	DARK: 'DARK',
	LIGHT: 'LIGHT'
} as const;
export type ThemesType = (typeof ThemeOptions)[keyof typeof ThemeOptions];

export const LanguageOptions = {
	ENGLISH: 'EN'
} as const;
export type LanguagesType = (typeof LanguageOptions)[keyof typeof LanguageOptions];
