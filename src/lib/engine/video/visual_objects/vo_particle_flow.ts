/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Container, Graphics } from 'pixi.js';
import type { TickUnit } from '../tick_units/tick_unit';
import { mutateBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { UUIDv4 } from '$lib/types/common_types';
import type { SaveVO_ParticleFlow } from '$lib/store/save_structure/save_latest';
import { Vec2 } from '$lib/math';
import { AudioSpectrumProcessor } from '../tick_units/audio_spectrum_processor';

const SPECTRUM_VALUE_RESOLUTION = 65_536;
const DEFAULT_PARTICLE_SPEED = 1;
const OUT_OF_BOUNDS_MARGIN = 5;
// TODO: https://github.com/Picorims/wav2bar/blob/develop/js/visual_objects/visual_object.js#L672

export class VO_ParticleFlow implements VisualObjectRenderer<SaveVO_ParticleFlow> {
	private saveId: UUIDv4;
	private container: Container;
	private graphics: Graphics;
	private tickUnit: AudioSpectrumProcessor;
	private width: number = 1;
	private height: number = 1;
	private radiusMin: number = 1;
	private radiusMax: number = 1;
	private flowType: 'directional' | 'radial' = 'directional';
	private flowCenter: Vec2 = new Vec2(0, 0);
	/**
	 * In degrees
	 */
	private flowDirection: number = 0;
	private density: number = 1;
	private volume: number = 0;
	private color: string = '#FFFFFF';
	private particles: Particle[] = [];

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
		this.graphics = new Graphics();
		this.tickUnit = new AudioSpectrumProcessor();
		this.tickUnit.setMapping({
			mappedLength: -1,
			minPercent: 0,
			maxPercent: 100,
			toLog: true
		});
		this.tickUnit.subscribe(([spectrum]) => {
			this.volume = this.tickUnit.average(spectrum) / SPECTRUM_VALUE_RESOLUTION;
			this.tick();
			this.render(this.graphics);
		});
	}
	update(obj: SaveVO_ParticleFlow) {
		this.width = obj.size.width;
		this.height = obj.size.height;
		this.radiusMin = obj.particle_radius_range[0];
		this.radiusMax = obj.particle_radius_range[1];
		this.flowType = obj.flow_type;
		this.flowCenter = new Vec2(obj.flow_center[0], obj.flow_center[1]);
		this.flowDirection = obj.flow_direction;
		this.density = obj.particle_spawn_probability * obj.particle_spawn_tests;
		this.color = obj.color;
		this.particles = [];

		// spawn particles based on density to fill the initial area
		const count = this.width * this.height * this.density * 0.001;
		for (let i = 0; i < count; i++) {
			const pos = this.getRandomInitPosition();
			this.particles.push(
				new Particle(
					pos,
					this.getRandomRadius(),
					DEFAULT_PARTICLE_SPEED,
					this.getInitDirectionRadians(pos)
				)
			);
		}

		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);

		const graphics = new Graphics();
		this.render(graphics);
		this.container.addChild(graphics);

		this.graphics = graphics;
	}
	private tick() {
		// spawn new particles based on density
		const spawnCountMin = Math.floor(this.density);
		const spawnCountMax = Math.ceil(this.density);
		const remainder = this.density - spawnCountMin;
		// If we are closer to max, the biggest range is [0, remainder],
		// which should be associated to the max to make it more frequent than min.
		const spawnCount = Math.random() < remainder ? spawnCountMax : spawnCountMin;
		for (let i = 0; i < spawnCount; i++) {
			const radius = this.getRandomRadius();
			const pos = this.getRandomSpawnPosition(radius);
			this.particles.push(
				new Particle(pos, radius, DEFAULT_PARTICLE_SPEED, this.getSpawnDirectionRadians())
			);
		}

		// tick particles
		for (const particle of this.particles) {
			particle.tick(this.volume);
		}

		// remove particles that are out of bounds
		// we use a margin to not kill just spawner particles in the "directional" configuration.
		this.particles = this.particles.filter((particle) => {
			return (
				particle.position.x + (particle.radius + OUT_OF_BOUNDS_MARGIN) >= 0 &&
				particle.position.x - (particle.radius + OUT_OF_BOUNDS_MARGIN) <= this.width &&
				particle.position.y + (particle.radius + OUT_OF_BOUNDS_MARGIN) >= 0 &&
				particle.position.y - (particle.radius + OUT_OF_BOUNDS_MARGIN) <= this.height
			);
		});
	}
	private render(graphics: Graphics) {
		graphics.clear();

		for (const particle of this.particles) {
			graphics.circle(particle.position.x, particle.position.y, particle.radius);
		}

		graphics.fill(this.color);
	}
	getContainer(): Container {
		return this.container;
	}
	getTickUnit() {
		return this.tickUnit as TickUnit<unknown>;
	}

	/**
	 * Random position for the initial particles
	 */
	private getRandomInitPosition(): Vec2 {
		return new Vec2(Math.random() * this.width, Math.random() * this.height);
	}
	/**
	 * Random position for spawning new particles during playback
	 */
	private getRandomSpawnPosition(radius: number): Vec2 {
		if (this.flowType === 'radial') {
			return this.flowCenter;
		} else if (this.flowType === 'directional') {
			// to spread particles evenly, the amount spawned on each side depends on the flow direction
			// IMPORTANT: 90° is down because the y axis goes downwards in screen coordinates

			// FIXME: Consider optimization by not redoing the conversion each time

			const verticalProbability = Math.abs(Math.sin(this.flowDirection * (Math.PI / 180)));
			// horizontal probability = 1 - verticalProbability; so deduced and not needed.

			const useVerticalAxis = Math.random() < verticalProbability;
			if (useVerticalAxis) {
				// vertical axis
				const spawnTop = Math.sin(this.flowDirection * (Math.PI / 180)) > 0;
				const y = spawnTop ? 0 - radius : this.height + radius;
				const x = Math.random() * this.width;
				return new Vec2(x, y);
			} else {
				// horizontal axis
				const spawnLeft = Math.cos(this.flowDirection * (Math.PI / 180)) > 0;
				const x = spawnLeft ? 0 - radius : this.width + radius;
				const y = Math.random() * this.height;
				return new Vec2(x, y);
			}
		} else {
			return new Vec2(0, 0);
		}
	}

	private getRandomRadius(): number {
		if (this.radiusMin === this.radiusMax) {
			return this.radiusMin;
		}
		return this.radiusMin + Math.random() * (this.radiusMax - this.radiusMin);
	}

	private getInitDirectionRadians(pos: Vec2): number {
		if (this.flowType === 'directional') {
			return this.flowDirection * (Math.PI / 180);
		} else if (this.flowType === 'radial') {
			// based on the center position, we go away from the center
			const dirVec = pos.sub(this.flowCenter);
			return Math.atan2(dirVec.y, dirVec.x);
		}
		return 0;
	}

	private getSpawnDirectionRadians(): number {
		if (this.flowType === 'directional') {
			return this.flowDirection * (Math.PI / 180);
		} else if (this.flowType === 'radial') {
			return Math.random() * 2 * Math.PI;
		}
		return 0;
	}

	destroy(): void {
		this.container.parent?.removeChild(this.container);
		this.container.destroy({ children: true });
		this.graphics.destroy();
		this.particles = [];
	}
}

/**
 * Particle flow's particle model
 */
class Particle {
	// eslint-disable-next-line no-underscore-dangle
	private _radius: number;
	private speed: number;
	/**
	 * In radians
	 */
	private direction: number;
	// eslint-disable-next-line no-underscore-dangle
	private _position: Vec2;
	private velocity: Vec2;

	get radius(): number {
		return this._radius;
	}
	get position(): Vec2 {
		return this._position;
	}

	/**
	 * Direction is in radians
	 */
	constructor(
		position: Vec2 = new Vec2(0, 0),
		radius: number = 1,
		speed: number = 1,
		direction: number = 0
	) {
		this._position = position;
		this._radius = radius;
		this.speed = speed;
		this.direction = direction;
		this.velocity = new Vec2(Math.cos(direction) * speed, Math.sin(direction) * speed);
	}

	public tick(volume: number): void {
		// FIXME: Copilot: Using Math.pow(volume * 10, 2) for squaring is less efficient
		// than using the exponentiation operator (volume * 10) ** 2
		// or simple multiplication (volume * 10) * (volume * 10).
		// Since this is called every tick for every particle,
		// the performance difference could be noticeable with many particles.
		this.velocity = new Vec2(
			Math.cos(this.direction) * this.speed * Math.pow(volume * 10, 2),
			Math.sin(this.direction) * this.speed * Math.pow(volume * 10, 2)
		);
		this._position = this._position.add(this.velocity);
	}
}
