/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from "$lib/engine/audio/audio_provider";
import { TickUnit } from "./tick_unit";

export class TrackProgressTracker extends TickUnit<number> {
    private static _DEFAULT_VALUE = 0;
    
    constructor() {
        super(TrackProgressTracker._DEFAULT_VALUE);
    }

    getDefaultValue(): number {
        return TrackProgressTracker._DEFAULT_VALUE;
    }

    protected computeNewState(_basis: number, audioProvider: AudioProvider | null): number {
        if (!audioProvider) {
            return this.getDefaultValue();
        }
        
        const durationMs = audioProvider.getDuration();
        if (durationMs <= 0) {
            return this.getDefaultValue();
        }
        const currentTimeMs = audioProvider.getCurrentAudioTime();

        return currentTimeMs / durationMs;
    }
}