/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Application, Container, Rectangle, Texture } from 'pixi.js';
import 'pixi.js/unsafe-eval';
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
import { VO_VisualizerStraightWave } from './visual_objects/vo_visualizer_straight_wave';
import { VO_VisualizerCircularBar } from './visual_objects/vo_visualizer_circular_bar';
import { VO_TimerStraightLinePoint } from './visual_objects/vo_timer_straight_line_point';
import { VO_TimerStraightBar } from './visual_objects/vo_timer_straight_bar';
import { VO_ParticleFlow } from './visual_objects/vo_particle_flow';
import { Atlas } from './atlas';
import { VO_ImageShape } from './visual_objects/vo_image_shape';

interface RendererEvent<T extends RendererEventName> {
	name: T;
	payload: RendererEventPayload<T>;
}

type RendererEventName =
	| 'object_register'
	| 'object_update'
	| 'clear_all_objects'
	| 'clear_single_object';

type IdPayload = {
	id: UUIDv4;
};

type RendererEventPayload<T extends RendererEventName> = T extends 'object_register'
	? IdPayload
	: T extends 'object_update'
		? IdPayload
		: T extends 'clear_all_objects'
			? null
			: T extends 'clear_single_object'
				? IdPayload
				: never;

const END_OF_TRACK_THRESHOLD_SECONDS = 0.001; // in seconds
/**
 * Pixi.js renderer, drives the tick and audio engines.
 */
export class Renderer {
	private app: Application;
	private hasInitBool = false;
	private tickEngine: TickEngine;
	private audioProvider: AudioProvider | null = null;
	private visualObjects: Map<UUIDv4, VisualObjectRenderer<VisualObject>> = new Map();
	private events: RendererEvent<RendererEventName>[] = [];
	private paused: boolean;
	private looped: boolean = false;
	private pendingStateUpdates: {
		fps: number | null;
		width: number | null;
		height: number | null;
	};
	private atlas: Atlas;

	constructor() {
		this.pendingStateUpdates = {
			fps: null,
			width: null,
			height: null
		};
		this.app = new Application();
		globalThis.__PIXI_APP__ = this.app;
		this.tickEngine = new TickEngine();
		this.atlas = new Atlas();
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
					const payload = e.payload as RendererEvent<'object_register'>['payload'];
					this.registerObject(payload.id, saveManager.save.objects[payload.id]);
				} else if (e.name === 'object_update') {
					const payload = e.payload as RendererEvent<'object_update'>['payload'];
					this.updateObject(payload.id, saveManager.save.objects[payload.id]);
				} else if (e.name === 'clear_all_objects') {
					this.clearAllObjects();
				} else if (e.name === 'clear_single_object') {
					const payload = e.payload as RendererEvent<'clear_single_object'>['payload'];
					this.clearSingleObject(payload.id);
				} else {
					throw new Error(`Unknown renderer event: ${e.name}`);
				}
			}
			this.events = [];
		});

		this.paused = true;
		this.hasInitBool = true;

		// Apply pending state updates that needed initialization
		if (this.pendingStateUpdates.fps !== null) {
			this.setFPS(this.pendingStateUpdates.fps);
			this.pendingStateUpdates.fps = null;
		}
		if (this.pendingStateUpdates.width !== null && this.pendingStateUpdates.height !== null) {
			this.setResolution(this.pendingStateUpdates.width, this.pendingStateUpdates.height);
			this.pendingStateUpdates.width = null;
		}
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
		this.audioProvider.shallLoop(this.looped);
		this.paused = true;
	}

	getFPS() {
		if (!this.hasInit()) throw new Error('Renderer not initialized');
		return this.app.ticker.maxFPS;
	}
	setFPS(fps: number) {
		if (!this.hasInit()) {
			Log.renderer.info(`Delaying FPS set to ${fps} until initialization`);
			this.pendingStateUpdates.fps = fps;
			return;
		}
		Log.renderer.info(`Setting FPS to ${fps}`);
		this.app.ticker.maxFPS = fps;
	}
	setResolution(width: number, height: number) {
		if (!this.hasInit()) {
			Log.renderer.info(`Delaying resolution set to ${width}x${height} until initialization`);
			this.pendingStateUpdates.width = width;
			this.pendingStateUpdates.height = height;
			return;
		}
		Log.renderer.info(`Setting resolution to ${width}x${height}`);
		this.app.renderer.resize(width, height);
	}

	setImageURLResolutionMethod(method: (path: string, objectId: string) => Promise<string>) {
		this.atlas.setImageResolutionMethod(method);
	}

	getPerfFPS() {
		if (!this.hasInit()) {
			return 0;
		}
		return this.app.ticker.FPS;
	}
	getPerfTPS() {
		if (!this.hasInit()) {
			return 0;
		}
		return this.tickEngine.lastPerfTps;
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

	resetTickEngine() {
		this.tickEngine.reset();
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

	reachedEnd() {
		return this.getProgress() >= this.getDuration();
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
		console.log('Scheduling renderer event', event);
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
		} else if (obj.visual_object_type === 'visualizer_straight_wave') {
			newVisualObject = new VO_VisualizerStraightWave(id);
		} else if (obj.visual_object_type === 'visualizer_circular_bar') {
			newVisualObject = new VO_VisualizerCircularBar(id);
		} else if (obj.visual_object_type === 'timer_straight_line_point') {
			newVisualObject = new VO_TimerStraightLinePoint(id);
		} else if (obj.visual_object_type === 'timer_straight_bar') {
			newVisualObject = new VO_TimerStraightBar(id);
		} else if (obj.visual_object_type === 'particle_flow') {
			newVisualObject = new VO_ParticleFlow(id);
		} else if (obj.visual_object_type === 'shape') {
			newVisualObject = new VO_ImageShape(id);
		} else {
			Log.renderer.warn('Unknown object type, registering placeholder object');
		}
		this.visualObjects.set(id, newVisualObject);

		const tickUnit = newVisualObject.getTickUnit();
		if (tickUnit) {
			this.tickEngine.addTickUnit(tickUnit);
		}

		this.updateObject(id, obj, true);
	}

	updateObject(id: UUIDv4, obj: VisualObject, addContainer: boolean = false) {
		if (!this.visualObjects.has(id)) {
			throw new Error('Object not found in renderer');
		}
		this.visualObjects.get(id)!.update(obj, this.atlas);
		if (addContainer) {
			this.app.stage.addChild(this.visualObjects.get(id)!.getContainer());
		}
	}

	private clearAllObjects() {
		Log.renderer.info('Clearing all visual objects from renderer');
		this.visualObjects.clear();
		this.app.stage.removeChildren();
		this.tickEngine.clearAllTickUnits();
	}

	private clearSingleObject(id: UUIDv4) {
		Log.renderer.info(`Clearing object ${id} from renderer`);
		if (!this.visualObjects.has(id)) {
			throw new Error('Object not found in renderer');
		}
		const obj = this.visualObjects.get(id);
		this.tickEngine.removeTickUnit(obj?.getTickUnit() ?? null);
		obj?.destroy();
		this.visualObjects.delete(id);
	}

	generateTexture(container: Container, frame?: Rectangle): Texture {
		if (!this.hasInit()) {
			throw new Error('Cannot generate texture, renderer not initialized');
		}
		return this.app.renderer.generateTexture({
			target: container,
			frame
		});
	}

	/**
	 * Returns the current frame as raw pixels
	 */
	async getSnapshot() {
		return this.app.renderer.extract.pixels({
			target: this.app.stage,
			frame: this.app.screen
		});
	}
}

/**
 * Initialized by the Renderer component.
 */
export const renderer = new Renderer();
