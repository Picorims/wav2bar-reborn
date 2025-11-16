/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
import { saveManager } from '$lib/store/save.svelte';
import { Log } from '$lib/log/logger';
import { clamp } from '$lib/math';
import { VO_VisualizerStraightBar } from './visual_objects/vo_visualizer_straight_bar';

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


const END_OF_TRACK_THRESHOLD_SECONDS = 0.001; // in seconds
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
	private paused: boolean;
	private looped: boolean = false;

	constructor() {
		this.app = new PIXI.Application();
		globalThis.__PIXI_APP__ = this.app;
		this.tickEngine = new TickEngine();
		this.paused = true;
	}

	/**
	 * Initialize the Pixi.js renderer
	 */
	async init(width: number, height: number, fps: number) {
		await this.app.init({ width, height });
		this.app.ticker.maxFPS = fps;
		this.app.ticker.autoStart = true;
		this.app.ticker.add(() => this.update());

		saveManager.subscribeToMutations(() => {
			for (const e of this.events) {
				Log.renderer.debug(`Processing event ${e.name}`, e.toString());

				if (e.name === 'object_register') {
					this.registerObject(e.payload.id, saveManager.save.objects[e.payload.id]);
				} else if (e.name === 'object_update') {
					this.updateObject(e.payload.id, saveManager.save.objects[e.payload.id]);
				}
			}
			this.events = [];
		});

		this.paused = true;
		this.hasInitBool = true;
	}

	hasInit() {
		return this.hasInitBool;
	}

	setAudioProvider(provider: AudioProvider) {
		this.audioProvider = provider;
		this.audioProvider.setRenderer(this);
		if (!this.audioProvider.hasInit()) {
			this.audioProvider.init();
		}
		this.tickEngine.setAudioProvider(provider);
		this.audioProvider.setRendererFPS(this.app.ticker.maxFPS);
		this.audioProvider.shallLoop(this.looped);
		this.paused = true;
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
		this.paused = false;
	}
	/**
	 * Keeps the renderer active but stops the tick engine.
	 * Use `play` to restart the tick engine.
	 */
	pauseTick() {
		this.tickEngine.pause();
		this.audioProvider?.pause();
		this.paused = true;
	}
	isPaused() {
		return this.paused;
	}
	stop() {
		this.app.ticker.stop();
		this.tickEngine.stop();
		this.audioProvider?.stop();
		this.paused = true;
	}

	seekToStart() {
		this.audioProvider?.seekTo(0);
	}
	seekToEnd() {
		this.audioProvider?.seekTo(this.audioProvider.getDuration());
		this.paused = true;
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
	seekToRelative(ms: number) {
		if (!this.audioProvider) return;
		const currentTime = this.audioProvider.getCurrentAudioTime();
		const newTime = clamp(currentTime + ms, 0, this.audioProvider.getDuration());
		const duration = this.audioProvider.getDuration();
		if (newTime >= duration - END_OF_TRACK_THRESHOLD_SECONDS && !this.looped) {
			this.paused = true;
		}
		this.audioProvider.seekTo(newTime);
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

	shallLoop(loop: boolean) {
		this.looped = loop;
		this.audioProvider?.shallLoop(loop);
		Log.renderer.info(`Set looped to ${loop}`);
	}
	isLooped() {
		return this.looped;
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
		Log.renderer.info(`Registering object ${id} of type ${obj.visual_object_type}`);
		let newVisualObject: VisualObjectRenderer<VisualObject> = new PlaceHolderVisualObjectRenderer();

		if (obj.visual_object_type === 'text') {
			newVisualObject = new VO_Text(id);
		} else if (obj.visual_object_type === 'visualizer_straight_bar') {
			newVisualObject = new VO_VisualizerStraightBar(id);
		} else {
			Log.renderer.warn('Unknown object type, registering placeholder object');
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
