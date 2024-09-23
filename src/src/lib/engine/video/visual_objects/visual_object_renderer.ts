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