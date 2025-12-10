/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Container, Graphics } from "pixi.js";
import type { TickUnit } from "../tick_units/tick_unit";
import { getBaseVOContainer, type VisualObjectRenderer } from "./visual_object_renderer";
import type { UUIDv4 } from "$lib/types/common_types";
import type { SaveVO_ParticleFlow } from "$lib/store/save_structure/save_latest";
import { Vec2 } from "$lib/math";
import { AudioSpectrumProcessor } from "../tick_units/audio_spectrum_processor";

const SPECTRUM_VALUE_RESOLUTION = 65_536;
const DEFAULT_PARTICLE_SPEED = 1;
// TODO: https://github.com/Picorims/wav2bar/blob/develop/js/visual_objects/visual_object.js#L672


export class VO_ParticleFlow implements VisualObjectRenderer<SaveVO_ParticleFlow> {
    private _saveId: UUIDv4;
    private _container: Container;
    private _graphics: Graphics;
    private _tickUnit: AudioSpectrumProcessor;
    private _width: number = 1;
    private _height: number = 1;
    private _radiusMin: number = 1;
    private _radiusMax: number = 1;
    private _flowType: "directional" | "radial" = "directional";
    private _flowCenter: Vec2 = new Vec2(0, 0);
    /**
     * In degrees
     */
    private _flowDirection: number = 0;
    private _density: number = 1;
    private _volume : number = 0;
    private _color: string = "#FFFFFF";
    private _particles: Particle[] = [];


    constructor(saveId: UUIDv4) {
        this._saveId = saveId;
        this._container = new Container();
        this._graphics = new Graphics();
        this._tickUnit = new AudioSpectrumProcessor();
        this._tickUnit.subscribe(([spectrum]) => {
            this._volume = this._tickUnit.average(spectrum) / SPECTRUM_VALUE_RESOLUTION;
            this._render(this._graphics);
        });

    }
    update(obj: SaveVO_ParticleFlow): Container {
        this._width = obj.size.width;
        this._height = obj.size.height;
        this._radiusMin = obj.particle_radius_range[0];
        this._radiusMax = obj.particle_radius_range[1];
        this._flowType = obj.flow_type;
        this._flowCenter = new Vec2(obj.flow_center[0], obj.flow_center[1]);
        this._flowDirection = obj.flow_direction;
        this._density = obj.particle_spawn_probability * obj.particle_spawn_tests;
        this._color = obj.color;
        this._particles = [];

        // spawn particles based on density to fill the initial area
        const count = this._width * this._height * this._density * 0.001;
        for (let i = 0; i < count; i++) {
            const pos = this._getRandomPosition();
            this._particles.push(new Particle(pos, this._getRandomRadius(), DEFAULT_PARTICLE_SPEED, this._getInitDirectionRadians(pos)));
        }


        const container = getBaseVOContainer(obj);

        const graphics = new Graphics();
        this._render(graphics);
        container.addChild(graphics);

        this._container = container;
        this._graphics = graphics;
        return this._container;
    }
    private _render(graphics: Graphics) {
        graphics.clear();
        
        for (const particle of this._particles) {
            graphics.circle(particle.position.x, particle.position.y, particle.radius);
        }
        
        graphics.fill(this._color);
    }
    getContainer(): Container {
        return this._container;
    }
    getTickUnit() {
        return this._tickUnit as TickUnit<unknown>;
    }

    private _getRandomPosition(): Vec2 {
        return new Vec2(
            Math.random() * this._width,
            Math.random() * this._height
        );
    }

    private _getRandomRadius(): number {
        if (this._radiusMin === this._radiusMax) {
            return this._radiusMin;
        }
        return this._radiusMin + Math.random() * (this._radiusMax - this._radiusMin);
    }

    private _getInitDirectionRadians(pos: Vec2): number {
        if (this._flowType === "directional") {
            return this._flowDirection * (Math.PI / 180);
        } else if (this._flowType === "radial") {
            // based on the center position, we go away from the center
            const dirVec = pos.sub(this._flowCenter);
            return Math.atan2(dirVec.y, dirVec.x);
        }
        return 0;
    }
}

/**
 * Particle flow's particle model
 */
class Particle {
    private _radius: number;
    private _speed: number;
    /**
     * In radians
     */
    private _direction: number;
    private _position: Vec2;
    private _velocity: Vec2;

    get radius(): number {
        return this._radius;
    }
    get position(): Vec2 {
        return this._position;
    }

    /**
     * Direction is in radians
     */
    constructor(position: Vec2 = new Vec2(0, 0), radius: number = 1, speed: number = 1, direction: number = 0) {
        this._position = position;
        this._radius = radius;
        this._speed = speed;
        this._direction = direction;
        this._velocity = new Vec2(
            Math.cos(direction) * speed,
            Math.sin(direction) * speed
        );
    } 
}