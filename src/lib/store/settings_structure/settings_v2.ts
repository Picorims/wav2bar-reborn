/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { version } from "$app/environment";
import { LanguageOptions, ThemeOptions, type LanguagesType, type ThemesType } from "../settings_structure/settings_enums";

/**
 * For versions 1.0.0-beta.1 and above
 */
export interface SettingsV2 {
    save_version: 2;
    software_version_used: string;
    //TODO: software_version_first_created: string;
    ffmpeg_path: string;
    theme: ThemesType;
    language: LanguagesType;
}

export const defaultSettingsV2: SettingsV2 = {
    save_version: 2,
    software_version_used: version,
    ffmpeg_path: "",
    theme: ThemeOptions.DEFAULT,
    language: LanguageOptions.ENGLISH,
}