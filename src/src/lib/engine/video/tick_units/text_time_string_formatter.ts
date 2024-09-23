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

import type { AudioProvider } from "$lib/engine/audio/audio_provider";
import { withLeadingZero } from "$lib/string";
import { TickUnit } from "./tick_unit";

export class TextTimeStringFormatter extends TickUnit<string> {
    private static _DEFAULT_VALUE = "00:00 | 00:00";
    
    constructor() {
        super(TextTimeStringFormatter._DEFAULT_VALUE);
    }

    getDefaultValue(): string {
        return TextTimeStringFormatter._DEFAULT_VALUE;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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