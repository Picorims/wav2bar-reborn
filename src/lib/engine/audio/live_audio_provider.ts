/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Log } from '$lib/log/logger';
import { AudioProvider } from './audio_provider';

/**
 * Use the microphone as audio input
 */
export class LiveAudioProvider extends AudioProvider {
    private hasInitBool = false;
    private audioCtx: AudioContext;
    private analyser: AnalyserNode;
    private source: MediaStreamAudioSourceNode | undefined;
	private chronoStart: number;
	private chronoPause: number;
	private stopped: boolean;
	private lastSpectrum: Uint8Array | undefined;
	private lastWaveform: Uint8Array | undefined;

    constructor() {
        super();
        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();
		this.chronoStart = performance.now();
		this.chronoPause = -1;
		this.stopped = true;
	}
	async init() {
        if (this.hasInit()) return;
        this.analyser.fftSize = AudioProvider.DEFAULT_POINTS_COUNT * 2;

        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const source = this.audioCtx.createMediaStreamSource(micStream);
		source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.hasInitBool = true;
	}
	hasInit() {
		return this.hasInitBool;
	}
	play() {
		if (this.chronoPause !== -1 && !this.stopped) {
			this.chronoStart += performance.now() - this.chronoPause;
			this.chronoPause = -1;
		} else {
			this.chronoStart = performance.now();
			this.stopped = false;
		}
	}
	pause() {
		this.chronoPause = performance.now();
	}
	stop() {
		this.stopped = true;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setVolume(_volume: number) {
		Log.audio.info("Live audio provider cannot set volume, doing nothing");
	}
	getCurrentAudioTime() {
		if (this.stopped) {
			return 0;
		} else if (this.chronoPause === -1) {
			return performance.now() - this.chronoStart;
		} else {
			return this.chronoPause - this.chronoStart;
		}
	}
	getDuration() {
		return this.getCurrentAudioTime();
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	seekTo(_time: number) {
		Log.audio.info("Live audio provider cannot seek, doing nothing");
	}
	isPlaying() {
		return this.chronoPause === -1;
	}
	getCurrentAudioSpectrum(): Uint8Array {
        // We can use Float32Array instead of Uint8Array if we want higher precision
		if (this.lastSpectrum !== undefined && (this.stopped || this.chronoPause !== -1)) {
			return this.lastSpectrum;
		}
		const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
		this.lastSpectrum = dataArray;
        return dataArray;
	}
	getAudioSpectrumSize() {
		return this.analyser.frequencyBinCount;
	}
	setAudioSpectrumSize(size: number) {
		this.analyser.fftSize = size * 2;
	}
    getCurrentAudioWaveform(): Uint8Array {
        // We can use Float32Array instead of Uint8Array if we want higher precision
		if (this.lastWaveform !== undefined && (this.stopped || this.chronoPause !== -1)) {
			return this.lastWaveform;
		}
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
		this.lastWaveform = dataArray;
        return dataArray;
    }
}
