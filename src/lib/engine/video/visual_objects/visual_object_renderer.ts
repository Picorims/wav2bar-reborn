/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { VisualObject } from "$lib/store/save_structure/save_latest";
import { Container } from "pixi.js";
import type { TickUnit } from "../tick_units/tick_unit";

export interface VisualObjectRenderer<T extends VisualObject> {
    /**
     * Updates the pixi container according to the current save state
     * and return the container
     */
    update(obj: T): Container
    getContainer(): Container
    /**
     * returns null if there is no tick unit
     */
    getTickUnit(): TickUnit<unknown> | null
}

export class PlaceHolderVisualObjectRenderer implements VisualObjectRenderer<VisualObject> {
    private _container: Container;

    constructor() {
        this._container = new Container();
    }

    update(): Container {
        // console.log("PlaceHolderVisualObjectRenderer.update() called");
        
        return this._container;
    }

    getContainer(): Container {
        // console.log("PlaceHolderVisualObjectRenderer.getContainer() called");
        
        return this._container;
    }

    getTickUnit(): null {
        return null;
    }
}