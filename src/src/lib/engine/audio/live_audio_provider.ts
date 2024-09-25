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
		console.log("Live audio provider cannot set volume, doing nothing");
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
		console.log("Live audio provider cannot seek, doing nothing");
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
