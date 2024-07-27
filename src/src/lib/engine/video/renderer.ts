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

/**
 * Pixi.js renderer, drives the tick and audio engines.
 */
export class Renderer {
    private app: PIXI.Application;
    private hasInitBool = false;
    constructor() {
        this.app = new PIXI.Application();
    }

    /**
     * Initialize the Pixi.js renderer
     */
    async init(width: number, height: number, fps: number) {
        await this.app.init({width, height});
        this.app.ticker.maxFPS = fps;
        this.app.ticker.add(() => this.render());
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

    private render() {

    }

    play() {
        this.app.ticker.start();
    }
    stop() {
        this.app.ticker.stop();
    }
    update() {
        this.app.ticker.update();
    }
}