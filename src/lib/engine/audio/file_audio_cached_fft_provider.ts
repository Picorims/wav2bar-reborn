/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Log } from '$lib/log/logger';
import { invoke } from '@tauri-apps/api/core';
import { AudioProvider } from './audio_provider';
import { join } from '@tauri-apps/api/path';
import { readFile } from '@tauri-apps/plugin-fs';

export const SPECTRUM_SIZE_DEFAULT = 2048;
const CACHE_CAPACITY = 25;
const FFT_BLOCK_SIZE_SECONDS = 20; // must match audio.rs BLOCK_FILE_SIZE_SECONDS 

/**
 * Use backed FFT data computed from the save audio file, which is the audio input.
 */
export class FileAudioCachedFFTProvider extends AudioProvider {
    private hasInitBool = false;
    private audioElement: HTMLAudioElement;
    private cache: Map<number, {data: Uint8Array, loading: boolean, reads: number}> = new Map();
    /**
     * As per audio.rs command bake_fft, contains the list of frequencies
     * in Hz corresponding to the FFT values. The size is SPECTRUM_SIZE_DEFAULT.
     */
    private frequenciesCache: Uint8Array | null = null;

    constructor(audioElement: HTMLAudioElement) {
        super();
        if (!audioElement) {
            throw new Error("Audio element is required for FileAudioCachedFFTProvider");
        }
        this.audioElement = audioElement;
    }
    async init() {
        if (this.hasInit()) return;
        if (!this.renderer) {
            throw new Error("Renderer must be set before init");
        }

        this.audioElement.onended = () => {
            this.renderer?.pauseTick();
        }

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
    shallLoop(loop: boolean): void {
        this.audioElement.loop = loop;
    }
    getCurrentAudioSpectrum(): Uint8Array {
        const now = this.getCurrentAudioTime() / 1000; // seconds
        const currentFrame = Math.floor(now * this.rendererFPS);
        const blockIndex = Math.floor(now / FFT_BLOCK_SIZE_SECONDS);
        
        if (!this.cache.has(blockIndex)) {
            this.cacheFFTBlock(blockIndex);
            Log.audio.warn("FFT block not yet cached: " + blockIndex);
            const dataArray = new Uint8Array(this.getAudioSpectrumSize());
            return dataArray;
        }

        const cacheEntry = this.cache.get(blockIndex);
        // as per audio.rs command bake_fft, each block file contains SPECTRUM_SIZE_DEFAULT * FFT_BLOCK_SIZE_SECONDS * 1 byte
        const expectedBlockFrame = currentFrame % (FFT_BLOCK_SIZE_SECONDS * this.rendererFPS);
        const offset = expectedBlockFrame * SPECTRUM_SIZE_DEFAULT;
        if (!cacheEntry || cacheEntry.loading || offset + SPECTRUM_SIZE_DEFAULT > cacheEntry.data.length) {
            Log.audio.warn("FFT block still loading or invalid offset: " + blockIndex);
            const dataArray = new Uint8Array(this.getAudioSpectrumSize());
            return dataArray;
        }
        cacheEntry.reads += 1;
        const dataArray = cacheEntry.data.slice(offset, offset + SPECTRUM_SIZE_DEFAULT);

        // if less than 2 seconds remain in this block, start caching the next one
        // This must be done only if there is one more block
        // (i.e. we are not at the end of the audio)
        const atEndOfAudio = now + 2 >= this.getDuration() / 1000;
        const secondsIntoBlock = now - (blockIndex * FFT_BLOCK_SIZE_SECONDS);
        if (FFT_BLOCK_SIZE_SECONDS - secondsIntoBlock < 2 && !atEndOfAudio) {
            this.cacheFFTBlock(blockIndex + 1);
        }

        return dataArray;
    }
    getAudioSpectrumSize() {
        return SPECTRUM_SIZE_DEFAULT;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setAudioSpectrumSize(_size: number) {
        Log.audio.warn("FileAudioCachedFFTProvider: setAudioSpectrumSize not supported");
    }
    getCurrentAudioWaveform(): Uint8Array {
        Log.audio.warn("FileAudioCachedFFTProvider: getCurrentAudioWaveform not supported");
        const dataArray = new Uint8Array(this.getAudioSpectrumSize());
        return dataArray;
    }

    /**
     * Reads the corresponding FFT block file and caches it if not already cached
     * @param blockIndex 
     * @returns 
     */
    private async cacheFFTBlock(blockIndex: number) {
        if (this.cache.has(blockIndex)) {
            return;
        }
        this.cache.set(blockIndex, {data: new Uint8Array(), loading: true, reads: 0});
        const fftDir = await invoke<string>("get_fft_dir");
        const fftFilePath = await join(fftDir, `fft_block_${blockIndex}.bin`);
        try {
            const content = await readFile(fftFilePath);
            this.cache.set(blockIndex, {data: content, loading: false, reads: 0});

            this.pruneCacheIfNeeded();
        } catch (e) {
            Log.audio.error("Failed to read FFT block file: " + fftFilePath + " Error: " + (e as Error).message);
        }
    }

    private async cacheFrequenciesIfNeeded() {
        if (this.frequenciesCache !== null) {
            return;
        }
        const fftDir = await invoke<string>("get_fft_dir");
        const frequenciesFilePath = await join(fftDir, `fft_frequencies.bin`);
        try {
            const content = await readFile(frequenciesFilePath);
            this.frequenciesCache = content;
        } catch (e) {
            Log.audio.error("Failed to read frequencies file: " + frequenciesFilePath + " Error: " + (e as Error).message);
        }
    }

    /**
     * If the size exceeds the cache capacity, prunes the least recently used items
     * until the size is under (or equal to) the capacity
     */
    private pruneCacheIfNeeded() {
        if (this.cache.size <= CACHE_CAPACITY) {
            return;
        }
        const items = Array.from(this.cache.entries()); // key value pairs
        items.sort((a, b) => a[1].reads - b[1].reads);
        while (this.cache.size > CACHE_CAPACITY) {
            const itemToDelete = items.shift();
            if (itemToDelete) {
                this.cache.delete(itemToDelete[0] /*key*/);
            }
        }

    }
}
