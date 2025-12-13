/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from '$lib/engine/audio/audio_provider';
import { withLeadingZero } from '$lib/string';
import { TickUnit } from './tick_unit';

export class TextTimeStringFormatter extends TickUnit<string> {
	private static _DEFAULT_VALUE = '00:00 | 00:00';

	constructor() {
		super(TextTimeStringFormatter._DEFAULT_VALUE);
	}

	getDefaultValue(): string {
		return TextTimeStringFormatter._DEFAULT_VALUE;
	}

	protected computeNewState(_basis: string, audioProvider: AudioProvider | null): string {
		if (!audioProvider) {
			return this.getDefaultValue();
		}

		const durationMs = audioProvider.getDuration();
		const currentTimeMs = audioProvider.getCurrentAudioTime();

		const durationSeconds = Math.floor(durationMs / 1000);
		const currentTimeSeconds = Math.floor(currentTimeMs / 1000);

		const durationMinutes = Math.floor(durationSeconds / 60);
		const currentTimeMinutes = Math.floor(currentTimeSeconds / 60);

		const durationStr = `${withLeadingZero(durationMinutes)}:${withLeadingZero(durationSeconds % 60)}`;
		const currentTimeStr = `${withLeadingZero(currentTimeMinutes)}:${withLeadingZero(currentTimeSeconds % 60)}`;

		return `${currentTimeStr} | ${durationStr}`;
	}
}
