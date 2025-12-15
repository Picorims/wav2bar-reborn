/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { floor } from '$lib/math';
import type { AudioProvider } from '../audio/audio_provider';
import type { TickUnit } from './tick_units/tick_unit';

/**
 * manage the rendering state of the engine,
 * such as audio spectrums, audio position, etc.
 */
export class TickEngine {
	/**
	 * in ms
	 */
	private init: DOMHighResTimeStamp = 0;
	/**
	 * in ms
	 */
	private then: DOMHighResTimeStamp = 0;
	/**
	 * in ms
	 */
	private now: DOMHighResTimeStamp = 0;
	/**
	 * in ms
	 */
	private whenPaused: DOMHighResTimeStamp = 0;
	private isPlaying = false;
	/**
	 * ticks per second
	 */
	public tps = 60;

	private tickUnits: TickUnit<unknown>[] = [];
	private audioProvider: AudioProvider | null = null;
	private lastTickDurationMS = 0;

	constructor() {
		this.reset();
	}

	get lastPerfTps(): number {
		return this.lastTickDurationMS === 0 ? 0 : 1000 / this.lastTickDurationMS;
	}

	private reset() {
		this.init = 0;
		this.then = 0;
		this.now = 0;
		this.whenPaused = 0;
		this.isPlaying = false;
		this.tickUnits = [];
	}

	public setAudioProvider(audioProvider: AudioProvider) {
		this.audioProvider = audioProvider;
	}

	public addTickUnit(tickUnit: TickUnit<unknown>) {
		this.tickUnits.push(tickUnit);
	}

	public removeTickUnit(tickUnit: TickUnit<unknown>) {
		this.tickUnits = this.tickUnits.filter((unit) => unit !== tickUnit);
	}

	private getWindowNow() {
		return window.performance.now();
	}

	play() {
		this.isPlaying = true;
		if (this.init === 0) {
			this.init = this.getWindowNow();
		} else {
			/** shift the timeline to the duration ellapsed
			 * to make it as it never stopped
			 */
			this.init += this.getWindowNow() - this.whenPaused;
		}
	}

	pause() {
		this.isPlaying = false;
		this.whenPaused = this.getWindowNow();
	}

	stop() {
		this.reset();
	}

	/**
	 * call `tickOnce()` as many times as needed
	 * based on ellapsed time and `tps`.
	 * @returns
	 */
	tick() {
		if (!this.isPlaying) return;
		this.now = this.getWindowNow();
		const thenFrame = floor(this.then, 1000 / this.tps, this.init) / this.tps;
		const nowFrame = floor(this.now, 1000 / this.tps, this.init) / this.tps;
		/**
		 * Number of ticks to perform
		 */
		const deltaFrame = nowFrame - thenFrame;

		if (deltaFrame < 1) return;

		for (let i = 0; i < deltaFrame; i++) {
			this.tickOnce();
		}
		this.lastTickDurationMS = this.now - this.then;
		this.then = this.now;
	}

	/**
	 * Update the state of the engine.
	 * If using tick, this is already called.
	 * Otherwise, it can be used for asynchronous (i.e manual)
	 * control.
	 */
	tickOnce() {
		// =========================== /!\ /!\ /!\ ===============================
		// ALL UPDATES ARE FRAME BASED, NOT TIME BASED !!! (tick() is time based)
		// =========================== /!\ /!\ /!\ ===============================

		for (const tickUnit of this.tickUnits) {
			tickUnit.tick(this.audioProvider);
		}
	}

	clearAllTickUnits() {
		this.tickUnits = [];
	}
}
