/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { UUIDv4 } from '$lib/types/common_types';
import { Assets, Container, FillGradient, Graphics, Texture } from 'pixi.js';
import { getBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { SaveVO_ImageShape } from '$lib/store/save_structure/save_latest';
import type { Atlas } from '../atlas';

export class VO_ImageShape implements VisualObjectRenderer<SaveVO_ImageShape> {
    private saveId: UUIDv4;
    private container: Container;
    private texture: Texture | null = null;
    private caching: boolean = false;
    private currentType: SaveVO_ImageShape["background"]["type"] | null = null;
    private backgroundContent: string | null = null;

    constructor(saveId: UUIDv4) {
        this.saveId = saveId;
        this.container = new Container();
    }

    getTickUnit() {
        return null;
    }

    update(obj: SaveVO_ImageShape, atlas: Atlas): Container {
        const imageBackgroundDefined: boolean = obj.background.type === "image" && obj.background.last_image !== "";
        const shouldCreateImageCache: boolean = this.texture === null && !this.caching && imageBackgroundDefined;
        const shouldUpdateImageCache: boolean = !this.caching && imageBackgroundDefined && (this.currentType !== "image" || this.backgroundContent !== obj.background.last_image);
        if (shouldCreateImageCache || shouldUpdateImageCache) {
            this.cacheTexture(obj, obj.background.last_image, atlas);
            this.currentType = "image";
            this.backgroundContent = obj.background.last_image;
        }

        const container = getBaseVOContainer(obj);
        const width = obj.size.width;
        const height = obj.size.height;
        
        const graphics = new Graphics({
            width,
            height
        });
        graphics.rect(0, 0, width, height);

        if (obj.background.type === "color") {
            if (obj.background.last_color === "") {
                graphics.fill(0xFFFFFF); // Fallback to white if no color is defined
            } else {
                graphics.fill(obj.background.last_color);
            }
        } else if (obj.background.type === "image") {
            if (this.texture) {
                graphics.fill(this.texture);
            } else {
                graphics.fill(0xFFFFFF); // Fallback to white if texture is not ready
            }
        } else if (obj.background.type === "gradient") {
            const gradient = new FillGradient({
                type: "linear",
                colorStops: [
                    { offset: 0, color: "white"},
                    { offset: 1, color: "black"}
                ]
            })
            graphics.fill(gradient);
        }

        container.addChild(graphics);

        this.container = container;
        return this.container;
    }
    getContainer(): Container {
        return this.container;
    }

    private async cacheTexture(obj: SaveVO_ImageShape, path: string, atlas: Atlas) {
        this.caching = true;
        const image: ImageBitmap = await atlas.getImage(path);
        const texture = await Assets.load<Texture>(image);
        this.texture = texture;
        // Trigger texture update on the renderer.
        // Do so before disabling caching to avoid potential multiple updates
        // or unwanted infinite loops.
        this.update(obj, atlas);
        this.caching = false;
    }
}
