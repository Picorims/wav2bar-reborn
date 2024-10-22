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

/**
 * Base class for defining a way to provide audio data to the renderer
 */
export abstract class AudioProvider {
    static DEFAULT_POINTS_COUNT = 1024;
    abstract init(): Promise<void>;
    abstract hasInit(): boolean;
    abstract play(): void;
    abstract pause(): void;
    abstract stop(): void;
    abstract setVolume(volume: number): void;
    /** in ms */
    abstract getCurrentAudioTime(): number;
    /** in ms */
    abstract getDuration(): number;
    /**
     * 
     * @param time in ms
     */
    abstract seekTo(time: number): void;
    abstract isPlaying(): boolean;
    abstract getCurrentAudioSpectrum(): Uint8Array | number[];
    abstract getAudioSpectrumSize(): number;
    abstract setAudioSpectrumSize(size: number): void;
    abstract getCurrentAudioWaveform(): Uint8Array | number[];
}