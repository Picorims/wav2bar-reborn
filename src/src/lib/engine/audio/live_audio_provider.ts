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

export class LiveAudioProvider extends AudioProvider {
    private hasInitBool = false;
    private audioCtx: AudioContext;
    private analyser: AnalyserNode;
    private source: MediaStreamAudioSourceNode | undefined;

    constructor() {
        super();
        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();
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
		console.log("Live audio provider cannot play, doing nothing");
	}
	pause() {
		console.log("Live audio provider cannot pause, doing nothing");
	}
	stop() {
		console.log("Live audio provider cannot stop, doing nothing");
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setVolume(_volume: number) {
		console.log("Live audio provider cannot set volume, doing nothing");
	}
	getCurrentAudioTime() {
		return Infinity;
	}
	getDuration() {
		return Infinity;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	seekTo(_time: number) {
		console.log("Live audio provider cannot seek, doing nothing");
        
	}
	isPlaying() {
		return true;
	}
	getCurrentAudioSpectrum(): Uint8Array {
        // We can use Float32Array instead of Uint8Array if we want higher precision
		const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
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
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    }
}
