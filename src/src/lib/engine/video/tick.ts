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

import { floor } from "$lib/math";
import type { AudioProvider } from "../audio/audio_provider";
import type { TickUnit } from "./tick_units/tick_unit";

/**
 * manage the rendering state of the engine,
 * such as audio spectrums, audio position, etc.
 */
export class TickEngine {
	/**
	 * in ms
	 */
	private _init: DOMHighResTimeStamp = 0;
	/**
	 * in ms
	 */
	private _then: DOMHighResTimeStamp = 0;
	/**
	 * in ms
	 */
	private _now: DOMHighResTimeStamp = 0;
    /**
     * in ms
     */
    private _whenPaused: DOMHighResTimeStamp = 0;
    private _isPlaying = false;
    /**
     * ticks per second
     */
    public tps = 60;

    private _tickUnits: TickUnit<unknown>[] = [];
    private _audioProvider: AudioProvider | null = null;

	constructor() {
		this.reset();
	}

	private reset() {
		this._init = 0;
		this._then = 0;
		this._now = 0;
        this._whenPaused = 0;
        this._isPlaying = false;
        this._tickUnits = [];
	}

    public setAudioProvider(audioProvider: AudioProvider) {
        this._audioProvider = audioProvider;
    }

    public addTickUnit(tickUnit: TickUnit<unknown>) {
        this._tickUnits.push(tickUnit);
    }

    public removeTickUnit(tickUnit: TickUnit<unknown>) {
        this._tickUnits = this._tickUnits.filter(unit => unit !== tickUnit);
    }

	private getWindowNow() {
		return window.performance.now();
	}

	play() {
		this._isPlaying = true;
        if (this._init === 0) {
            this._init = this.getWindowNow();
        } else {
            /** shift the timeline to the duration ellapsed 
             * to make it as it never stopped
             */
            this._init += this.getWindowNow() - this._whenPaused;
        }
	}

    pause() {
        this._isPlaying = false;
        this._whenPaused = this.getWindowNow();
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
		if (!this._isPlaying) return;
		this._now = this.getWindowNow();
		const thenFrame = floor(this._then, 1000 / this.tps, this._init);
        const nowFrame = floor(this._now, 1000 / this.tps, this._init);
        /**
         * Number of ticks to perform
         */
        const deltaFrame = nowFrame - thenFrame;
        for (let i = 0; i < deltaFrame; i++) {
            this.tickOnce();
        }
        this._then = this._now;
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
    
        for (const tickUnit of this._tickUnits) {
            tickUnit.tick(this._audioProvider);
        }
    }
}
