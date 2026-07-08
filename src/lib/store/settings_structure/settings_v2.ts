/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { version } from '$app/environment';
import type { Wav2BarSettingsV2 } from '$lib/types/schemas/settings_v2';
import ajvSettingsV2Validate from '$lib/schemas/compiled/settings_v2_validate_esm';
import { errorToString } from '$lib/save_converter';

export const validateSettingsV2 = ajvSettingsV2Validate;

// export const defaultSettingsV2: Wav2BarSettingsV2 = {
// 	save_version: 2,
// 	software_version_used: version,
// 	software_version_first_created: version,
// 	ffmpeg_path: '',
// 	theme: ThemeOptions.DEFAULT,
// 	language: LanguageOptions.ENGLISH
// };

const baseDefaultSettings = {
	save_version: 2,
	software_version_used: version,
	software_version_first_created: version
};
console.log('alive');

const valid = validateSettingsV2(baseDefaultSettings);
if (!valid) {
	throw new Error(
		'Failed to setup default settings. Some defaults might be missing in the schema\n' +
			valid.errors?.map((e) => errorToString(e))
	);
}

export const defaultSettingsV2: Wav2BarSettingsV2 =
	baseDefaultSettings as unknown as Wav2BarSettingsV2;
