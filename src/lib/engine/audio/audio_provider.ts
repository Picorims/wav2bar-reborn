/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
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