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
	constructor() {
		this.reset();
	}
	private reset() {
		this.init = 0;
		this.then = 0;
		this.now = 0;
        this.whenPaused = 0;
        this.isPlaying = false;
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
		const thenFrame = floor(this.then, 1000 / this.tps, this.init);
        const nowFrame = floor(this.now, 1000 / this.tps, this.init);
        /**
         * Number of ticks to perform
         */
        const deltaFrame = nowFrame - thenFrame;
        for (let i = 0; i < deltaFrame; i++) {
            this.tickOnce();
        }
        this.then = this.now;
	}
	/**
     * Update the state of the engine.
     * If using tick, this is already called.
     * Otherwise, it can be used for asynchronous (i.e manual)
     * control.
     */
    tickOnce() {
        // ALL UPDATES ARE FRAME BASED, NOT TIME BASED !!!
        // ALL UPDATES ARE FRAME BASED, NOT TIME BASED !!!
        // ALL UPDATES ARE FRAME BASED, NOT TIME BASED !!!
    }
}
