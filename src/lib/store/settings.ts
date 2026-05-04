/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { writable } from 'svelte/store';
import lang_EN from '$lib/lang/en.json';
import type { SettingsV2 } from './settings_structure/settings_v2';
import { defaultSettingsV2 } from './settings_structure/settings_v2';
import { LanguageOptions } from './settings_structure/settings_enums';

export type Language = typeof lang_EN;

export const languages = {
	[LanguageOptions.ENGLISH]: lang_EN
};

export const lang = writable<Language>(languages[LanguageOptions.ENGLISH]);

export const settings = writable<SettingsV2>({ ...defaultSettingsV2 });

settings.subscribe((value) => {
	lang.set(languages[value.language]);
});
