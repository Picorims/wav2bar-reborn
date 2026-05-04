/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

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
	private lastSpectrum: Uint16Array | undefined;
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
	setVolume(_volume: number) {
		Log.audio.info('Live audio provider cannot set volume, doing nothing');
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
	seekTo(_time: number) {
		Log.audio.info('Live audio provider cannot seek, doing nothing');
	}
	isPlaying() {
		return this.chronoPause === -1;
	}
	shallLoop(loop: boolean): void {
		Log.audio.info(`Live audio provider cannot loop, ignoring shallLoop(${loop})`);
	}
	getCurrentAudioSpectrum(): Uint16Array {
		if (this.lastSpectrum !== undefined && (this.stopped || this.chronoPause !== -1)) {
			return this.lastSpectrum;
		}
		const bufferLength = this.analyser.frequencyBinCount;
		const dataArray = new Float32Array(bufferLength);
		this.analyser.getFloatFrequencyData(dataArray);
		const uint16Array = new Uint16Array(bufferLength);
		for (let i = 0; i < bufferLength; i++) {
			// Convert dB to linear amplitude, clamp to [0,1], then scale to 16-bit
			const linear = Math.pow(10, dataArray[i] / 20);
			uint16Array[i] = Math.max(0, Math.min(65535, Math.floor(linear * 65535)));
		}
		this.lastSpectrum = uint16Array;
		return uint16Array;
	}
	getAudioSpectrumSize() {
		return this.analyser.frequencyBinCount;
	}
	setAudioSpectrumSize(size: number) {
		this.analyser.fftSize = size * 2;
	}
	getFrequencies(): Uint16Array {
		const bufferLength = this.analyser.frequencyBinCount;
		const dataArray = new Uint16Array(bufferLength);

		// Currently, we don't have a way to cache frequencies over time in live audio
		// But we can deduce them as explained on MDN:
		// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
		// quote:
		// "Each item in the array represents the decibel value for a specific frequency.
		// The frequencies are spread linearly from 0 to 1/2 of the sample rate.
		// For example, for 48000 sample rate, the last item of the array
		// will represent the decibel value for 24000 Hz."
		const sampleRate = this.audioCtx.sampleRate;
		const nyquist = sampleRate / 2;
		const frequencyStep = nyquist / bufferLength;
		for (let i = 0; i < bufferLength; i++) {
			const frequency = i * frequencyStep;
			dataArray[i] = frequency;
		}

		return dataArray;
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
