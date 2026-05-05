/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import lang_EN from '$lib/lang/en.json';
import { defaultSettingsV2, validateSettingsV2 } from './settings_structure/settings_v2';
import { LanguageOptions } from './settings_structure/settings_enums';
import type { Wav2BarSettingsV2 } from '$lib/types/schemas/settings_v2';
import { invoke } from '@tauri-apps/api/core';
import { Log } from '$lib/log/logger';

export type Language = typeof lang_EN;

export const languages = {
	[LanguageOptions.ENGLISH]: lang_EN
};

let settingsState = $state<Wav2BarSettingsV2>({ ...defaultSettingsV2 });
const langDerived = $derived<Language>(languages[settingsState.language]);

export function lang() {
	return langDerived;
}
export function settings() {
	return settingsState;
}

/**
 * Takes the current settings state, and persists it as a JSON file
 * in the user data directory.
 */
export async function persistSettings() {
	Log.default.info('Persisting settings to file.');
	const jsonStr = JSON.stringify(settingsState);
	await invoke<void>('write_settings_json', { jsonContent: jsonStr });
}

export async function loadSettings() {
	if (!(await invoke('settings_json_exists'))) {
		// save default settings
		Log.default.info('No settings file found, writing default settings to disk.');
		persistSettings();
	} else {
		try {
			Log.default.info('Loading settings...');
			const json = await invoke<string>('read_settings_json');
			const parsedJson = JSON.parse(json);
			const valid = validateSettingsV2(parsedJson);
			if (!valid) {
				throw new Error(
					'Invalid settings JSON:\n' + validateSettingsV2.errors?.map((v) => `${v}\n`)
				);
			} else {
				settingsState = parsedJson as Wav2BarSettingsV2;
				Log.default.info('Settings loaded.');
			}
		} catch (e) {
			Log.default.error(
				`Failed to load settings (default settings will apply instead): ${typeof e === 'string' ? e : (e as Error).message}`
			);
		}
	}
}
