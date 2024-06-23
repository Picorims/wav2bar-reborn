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

import { version } from "$app/environment";
import { LanguageOptions, ThemeOptions, type LanguagesType, type ThemesType } from "../settings_structure/settings_enums";

/**
 * For versions 1.0.0-beta.1 and above
 */
export interface SettingsV2 {
    save_version: 2;
    software_version_used: string;
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