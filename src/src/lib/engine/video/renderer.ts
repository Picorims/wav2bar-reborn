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

import * as PIXI from 'pixi.js';
import { TickEngine } from './tick';
import type { AudioProvider } from '../audio/audio_provider';
import type { UUIDv4 } from '$lib/types/common_types';
import type { VisualObject } from '$lib/store/save_structure/save_latest';
import {
	PlaceHolderVisualObjectRenderer,
	type VisualObjectRenderer
} from './visual_objects/visual_object_renderer';
import { VO_Text } from './visual_objects/vo_text';
import { save } from '$lib/store/save';

interface RendererEvent<T extends RendererEventName> {
	name: T;
	payload: RendererEventPayload<T>;
}

type RendererEventName = 'object_register' | 'object_update';

type IdPayload = {
	id: UUIDv4;
};

type RendererEventPayload<T extends RendererEventName> = T extends 'object_register'
	? IdPayload
	: T extends 'object_update'
		? IdPayload
		: never;

/**
 * Pixi.js renderer, drives the tick and audio engines.
 */
export class Renderer {
	private app: PIXI.Application;
	private hasInitBool = false;
	private tickEngine: TickEngine;
	private audioProvider: AudioProvider | null = null;
	private visualObjects: Map<UUIDv4, VisualObjectRenderer<VisualObject>> = new Map();
	private events: RendererEvent<RendererEventName>[] = [];

	constructor() {
		this.app = new PIXI.Application();
		globalThis.__PIXI_APP__ = this.app;
		this.tickEngine = new TickEngine();
	}

	/**
	 * Initialize the Pixi.js renderer
	 */
	async init(width: number, height: number, fps: number) {
		await this.app.init({ width, height });
		this.app.ticker.maxFPS = fps;
		this.app.ticker.autoStart = true;
		this.app.ticker.add(() => this.update());

		save.subscribe((newSave) => {
			for (const e of this.events) {
				console.log(`Processing event ${e.name}`, e);

				if (e.name === 'object_register') {
					this.registerObject(e.payload.id, newSave.objects[e.payload.id]);
				} else if (e.name === 'object_update') {
					this.updateObject(e.payload.id, newSave.objects[e.payload.id]);
				}
			}
			this.events = [];
		});

		this.hasInitBool = true;
	}

	hasInit() {
		return this.hasInitBool;
	}

	setAudioProvider(provider: AudioProvider) {
		this.audioProvider = provider;
		if (!this.audioProvider.hasInit()) {
			this.audioProvider.init();
		}
	}

	/**
	 * After initialization, return the canvas
	 */
	getCanvas() {
		if (!this.hasInit()) throw new Error('Renderer not initialized');
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

	private render() {}

	play() {
		this.app.ticker.start();
		this.tickEngine.play();
		this.audioProvider?.play();
	}
	/**
	 * Keeps the renderer active but stops the tick engine.
	 * Use `play` to restart the tick engine.
	 */
	pauseTick() {
		this.tickEngine.pause();
		this.audioProvider?.pause();
	}
	stop() {
		this.app.ticker.stop();
		this.tickEngine.stop();
		this.audioProvider?.stop();
	}

	seekToStart() {
		this.audioProvider?.seekTo(0);
	}
	seekToEnd() {
		this.audioProvider?.seekTo(this.audioProvider.getDuration());
	}
	/**
	 *
	 * @param percent 0 to 100
	 */
	seekToPercent(percent: number) {
		if (!this.audioProvider) return;
		const duration = this.audioProvider.getDuration();
		const time = (percent / 100) * duration;
		this.audioProvider.seekTo(time);
	}

	/**
	 *
	 * @returns position in ms
	 */
	getProgress() {
		if (!this.audioProvider) return 0;
		return this.audioProvider.getCurrentAudioTime();
	}
	/**
	 * 
	 * @returns duration in ms
	 */
	getDuration() {
		if (!this.audioProvider) return 0;
		return this.audioProvider.getDuration();
	}

	/**
	 * Inform the renderer that the save will be mutated, and indicate
	 * what should be taken into account in the mutation.
	 * @param event
	 */
	scheduleRendererEvent(event: RendererEvent<RendererEventName>) {
		this.events.push(event);
	}

	/**
	 * Register a newly created object to the renderer.
	 * @param id
	 * @param type
	 */
	private registerObject(id: UUIDv4, obj: VisualObject) {
		console.log(`Registering object ${id} of type ${obj.visual_object_type}`);
		let newVisualObject: VisualObjectRenderer<VisualObject> = new PlaceHolderVisualObjectRenderer();

		if (obj.visual_object_type === 'text') {
			newVisualObject = new VO_Text(id);
		} else {
			console.warn('Unknown object type, registering placeholder object');
		}
		this.visualObjects.set(id, newVisualObject);

		const tickUnit = newVisualObject.getTickUnit();
		if (tickUnit) {
			this.tickEngine.addTickUnit(tickUnit);
		}

		this.updateObject(id, obj);
	}

	updateObject(id: UUIDv4, obj: VisualObject) {
		if (!this.visualObjects.has(id)) {
			throw new Error('Object not found in renderer');
		}
		const oldContainer = this.visualObjects.get(id)!.getContainer();
		const updatedContainer = this.visualObjects.get(id)!.update(obj);
		if (updatedContainer) {
			this.app.stage.removeChild(oldContainer);
			this.app.stage.addChild(updatedContainer);
		}
	}
}

/**
 * Initialized by the Renderer component.
 */
export const renderer = new Renderer();
