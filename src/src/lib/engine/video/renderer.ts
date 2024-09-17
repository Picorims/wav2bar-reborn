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

import * as PIXI from "pixi.js";
import { TickEngine } from "./tick";

/**
 * Pixi.js renderer, drives the tick and audio engines.
 */
export class Renderer {
    private app: PIXI.Application;
    private hasInitBool = false;
    private tickEngine: TickEngine;
    constructor() {
        this.app = new PIXI.Application();
        this.tickEngine = new TickEngine();
    }

    /**
     * Initialize the Pixi.js renderer
     */
    async init(width: number, height: number, fps: number) {
        await this.app.init({width, height});
        this.app.ticker.maxFPS = fps;
        this.app.ticker.autoStart = false;
        this.app.ticker.add(() => this.update());
        this.hasInitBool = true;
    }

    hasInit() {
        return this.hasInitBool;
    }

    /**
     * After initialization, return the canvas
     */
    getCanvas() {
        if (!this.hasInit()) throw new Error("Renderer not initialized");
        return this.app.canvas;
    }

    /**
     * Update the renderer with n ticks
     */
    private update() {
        this.tickEngine.tick();
        this.render();
    }

    /**
     * Update the renderer with a single tick,
     * useful for manual control of the renderer
     * instead of real-time rendering.
     */
    updateOnce() {
        this.tickEngine.tickOnce();
        this.render();
    }

    private render() {

    }

    play() {
        this.app.ticker.start();
        this.tickEngine.play();
    }
    /**
     * Keeps the renderer active but stops the tick engine.
     * Use `play` to restart the tick engine.
     */
    pauseTick() {
        this.tickEngine.pause();
    }
    stop() {
        this.app.ticker.stop();
        this.tickEngine.stop();
    }
}