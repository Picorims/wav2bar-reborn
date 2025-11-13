/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Log } from '$lib/log/logger';
import { AudioProvider } from './audio_provider';

export const SPECTRUM_SIZE_DEFAULT = 2048;

/**
 * Use the microphone as audio input
 */
export class FileAudioCachedFFTProvider extends AudioProvider {
    private hasInitBool = false;
    private stopped: boolean;
    private lastSpectrum: Uint8Array | undefined;
    private lastWaveform: Uint8Array | undefined;
    private audioElement: HTMLAudioElement;

    constructor(audioElement: HTMLAudioElement) {
        super();
        this.stopped = true;
        if (!audioElement) {
            throw new Error("Audio element is required for LiveAudioProvider");
        }
        this.audioElement = audioElement;
    }
    async init() {
        if (this.hasInit()) return;
        // TODO
        this.hasInitBool = true;
    }
    hasInit() {
        return this.hasInitBool;
    }
    play() {
        this.audioElement.play();
    }
    pause() {
        this.audioElement.pause();
    }
    stop() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.stopped = true;
    }
    setVolume(volume: number) {
        this.audioElement.volume = volume;
    }
    getCurrentAudioTime() {
        return this.audioElement.currentTime * 1000;
    }
    getDuration() {
        return this.audioElement.duration * 1000;
    }
    seekTo(time: number) {
        this.audioElement.currentTime = time / 1000;
    }
    isPlaying() {
        return !this.audioElement.paused;
    }
    getCurrentAudioSpectrum(): Uint8Array {
        // TODO
        Log.audio.warn("LiveAudioProvider: getCurrentAudioSpectrum not implemented yet");
        const dataArray = new Uint8Array(this.getAudioSpectrumSize());
        return dataArray;
    }
    getAudioSpectrumSize() {
        return SPECTRUM_SIZE_DEFAULT;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setAudioSpectrumSize(_size: number) {
        Log.audio.warn("LiveAudioProvider: setAudioSpectrumSize not supported");
    }
    getCurrentAudioWaveform(): Uint8Array {
        Log.audio.warn("LiveAudioProvider: getCurrentAudioWaveform not supported");
        const dataArray = new Uint8Array(this.getAudioSpectrumSize());
        return dataArray;
    }
}
