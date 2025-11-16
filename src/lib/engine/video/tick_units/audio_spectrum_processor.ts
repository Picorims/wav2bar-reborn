/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from "$lib/engine/audio/audio_provider";
import { TickUnit } from "./tick_unit";

export class AudioSpectrumProcessor extends TickUnit<Uint8Array> {
    private static _DEFAULT_VALUE = new Uint8Array(0);

    constructor() {
        super(AudioSpectrumProcessor._DEFAULT_VALUE);
    }

    getDefaultValue(): Uint8Array {
        return AudioSpectrumProcessor._DEFAULT_VALUE;
    }

    protected computeNewState(_basis: Uint8Array, audioProvider: AudioProvider | null): Uint8Array {
        if (!audioProvider) {
            return this.getDefaultValue();
        }

        return audioProvider.getCurrentAudioSpectrum();
    }
}