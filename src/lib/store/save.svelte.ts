/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { UUIDv4 } from '$lib/types/common_types';
// import { defaultSaveConfig, defaultVisualObject, type Save, type VisualObject, type VisualObject_Type } from "./save_structure/save_latest";
import { typedDeepClone } from '$lib/deep_clone';
import { renderer, type Renderer } from '$lib/engine/video/renderer';
import { Log } from '$lib/log/logger';
import {
	CURRENT_SAVE_VERSION,
	validateSave,
	validateSaveVisualObject,
	type Save,
	type VisualObject,
	type VisualObject_Type
} from './save_structure/save_latest';
import { version } from '$app/environment';
import { open, save } from '@tauri-apps/plugin-dialog';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { FileAudioCachedFFTProvider } from '$lib/engine/audio/file_audio_cached_fft_provider';
import { join } from '@tauri-apps/api/path';
import { setLoading, setLoadingInfo, setProjectName, setSaved } from './app_state.svelte';
import { SaveConverter } from '$lib/save_converter';

class SaveManager {
	private saveConfig = $state<Save>(this.getDefaultSave());
	private saveObjects = $derived<Save['objects']>(this.saveConfig.objects);
	public activeObject = $state<UUIDv4 | null>(null);

	get activeObjectData() {
		if (this.activeObject === null) return null;
		return this.saveObjects[this.activeObject];
	}

	get objectsCount() {
		return Object.keys(this.saveObjects).length;
	}

	/**
	 * In the following situations, the save state should not be directly mutated,
	 * but rather through the provided methods:
	 * - when opening a save file
	 * - when adding/removing objects
	 * - when changing fps or resolution
	 * - when mutating the active object
	 */
	get save() {
		return this.saveConfig;
	}

	get fps() {
		return this.saveConfig.fps;
	}
	set fps(value: number) {
		this.saveConfig.fps = value;
		renderer.setFPS(value);
		this.dispatchMutationUpdate();
	}
	get resolution() {
		return this.saveConfig.screen;
	}
	set resolution(value: { width: number; height: number }) {
		this.saveConfig.screen = value;
		renderer.setResolution(value.width, value.height);
		this.dispatchMutationUpdate();
	}

	private getDefaultSave(): Save {
		const baseObject = {
			save_version: CURRENT_SAVE_VERSION,
			software_version_used: version,
			software_version_first_created: version
		};
		const validWithDefaults = validateSave(baseObject);
		if (!validWithDefaults) {
			throw new Error(
				'Failed to create a default save because:\n\n' +
					validateSave.errors?.map((e) => `- ${e.instancePath} ${e.message}`).join('\n')
			);
		}
		// type is generated with the schema defaults,
		// and the TypeScript type originates from the same schema.
		// But TypeScript is not able to infer that here.
		return baseObject as unknown as Save;
	}

	private getDefaultVisualObject(type: VisualObject_Type): VisualObject {
		const baseObject = {
			visual_object_type: type
		};
		const validWithDefaults = validateSaveVisualObject(baseObject);
		if (!validWithDefaults) {
			throw new Error(
				`Failed to create a default visual object of type ${type} because:\n\n` +
					validateSaveVisualObject.errors?.map((e) => `- ${e.instancePath} ${e.message}`).join('\n')
			);
		}

		// type is generated with the schema defaults,
		// and the TypeScript type originates from the same schema.
		// But TypeScript is not able to infer that here.
		const typedObject = baseObject as unknown as VisualObject;

		// overrides not doable through the schema:
		if (typedObject.visual_object_type === 'shape') {
			typedObject.size = {
				width: 400,
				height: 300
			};
		} else if (typedObject.visual_object_type === 'visualizer_circular_bar') {
			typedObject.size = {
				width: 400,
				height: 400
			};
		} else if (
			typedObject.visual_object_type === 'visualizer_straight_bar' ||
			typedObject.visual_object_type === 'visualizer_straight_wave'
		) {
			typedObject.size = {
				width: 700,
				height: 200
			};
		} else if (
			typedObject.visual_object_type === 'timer_straight_bar' ||
			typedObject.visual_object_type === 'timer_straight_line_point'
		) {
			typedObject.size = {
				width: 700,
				height: 16
			};
		}
		return typedObject;
	}

	public async openSave(
		renderer: Renderer
	): Promise<{ success: boolean; message: string; warn: boolean }> {
		Log.save.info('Asking for a file to open');
		const path = await open({
			title: 'Pick a save file',
			multiple: false,
			directory: false,
			recursive: false,
			filters: [{ extensions: ['w2bzip'], name: 'Wav2Bar save file' }]
		});

		if (path === null) {
			Log.save.info('No file selected');
			return { success: true, message: 'No file selected.', warn: false };
		} else {
			setLoading(true);
			try {
				setLoadingInfo('Opening save file...');
				await invoke('open_save', { path: path as string });
				Log.save.info('Save file opened successfully, reading JSON...');
				setLoadingInfo('Reading save file...');
				const jsonStr = await invoke<string>('read_save_json');
				Log.save.info('Read JSON from save file, parsing it...');
				const saveJSON = JSON.parse(jsonStr);
				Log.save.info('Converting and validating save file...');
				setLoadingInfo('Converting and validating save file...');
				const result = SaveConverter.convert(saveJSON);
				if (!result.success || result.convertedSave === null) {
					return {
						success: false,
						warn: false,
						message:
							'Save file does not match the schema because:\nERRORS:\n' +
							result.errors.join('\n') +
							'\nWARNINGS:\n' +
							result.warnings.join('\n')
					};
				} else {
					Log.save.info('Save file is valid, loading it');
					setLoadingInfo('Loading save file...');
					this.saveConfig = result.convertedSave as unknown as Save;

					renderer.setFPS(this.saveConfig.fps);
					renderer.setResolution(this.saveConfig.screen.width, this.saveConfig.screen.height);

					await this.loadAudioFile();

					this.reloadAllObjects();
					setSaved(true);
					setProjectName(path.replaceAll(/^.*[/\\]/g, ''));

					Log.save.info('Save file loaded successfully');
					const returnObj = {
						success: true,
						message: 'Save file loaded successfully.',
						warn: false
					};
					if (result.warnings.length > 0) {
						returnObj.warn = true;
						returnObj.message += '\nWARNINGS:\n' + result.warnings.join('\n');
					}
					return returnObj;
				}
			} catch (e) {
				// Tauri errors are strings
				let error: string;
				if (typeof e === 'string') {
					error = 'Failed to open save file: ' + e;
				} else {
					error = 'Failed to open save file: ' + (e as Error).message;
				}
				error += '\n\nIN MEMORY SAVE:\n\n' + JSON.stringify(this.saveConfig, undefined, 8);
				Log.save.error(error);
				return { success: false, message: error, warn: false };
			} finally {
				setLoading(false);
			}
		}
	}

	public async saveToFile() {
		Log.save.info('Asking for a file to save to');
		const path = await save({
			title: 'Pick a file to save to',
			filters: [{ extensions: ['w2bzip'], name: 'Wav2Bar save file' }],
			defaultPath: 'project.w2bzip'
		});

		if (path === null) {
			Log.save.info('No file selected');
			return;
		} else {
			setLoading(true);
			setLoadingInfo('Saving file...');
			try {
				Log.save.info('Writing save JSON to file...');
				await invoke<void>('write_save_json', { jsonContent: JSON.stringify(this.saveConfig) });
				Log.save.info('Save JSON written to file, creating zip archive...');
				await invoke('save_to_file', { pathStr: path });
				Log.save.info('Save file saved successfully');
				setSaved(true);
				setProjectName(path.replaceAll(/^.*[/\\]/g, ''));
			} catch (e) {
				// Tauri errors are strings
				Log.save.error('Failed to save file: ' + e);
				return;
			} finally {
				setLoading(false);
			}
		}
	}

	public async loadAudioFile() {
		let audioFullPath: string | null = null;
		try {
			audioFullPath = await invoke<string>('get_audio_dir');
			audioFullPath = await join(audioFullPath, this.saveConfig.audio_filename);
		} catch (e) {
			Log.save.warn('Failed to get audio full path from backend: ' + (e as Error).message);
		}
		if (audioFullPath !== null) {
			Log.save.info(
				'Setting audio source to file audio provider with name: ' + this.saveConfig.audio_filename
			);
			const url = convertFileSrc(audioFullPath);
			const audioElement = document.getElementById('audio') as HTMLAudioElement;
			audioElement.src = url;
			audioElement.load();
			renderer.setAudioProvider(new FileAudioCachedFFTProvider(audioElement));
		}
	}

	/**
	 * Adds a new object to the save from the given type
	 * with default values
	 * @param type
	 */
	public addObject(type: VisualObject_Type) {
		/* TODO: undo/redo */
		const uuid: UUIDv4 = self.crypto.randomUUID() as UUIDv4;
		if (this.objectsCount === 0) {
			this.activeObject = uuid;
		}
		renderer.scheduleRendererEvent({
			name: 'object_register',
			payload: {
				id: uuid
			}
		});
		this.saveConfig.objects[uuid] = {
			...this.getDefaultVisualObject(type),
			name: type + '_' + Math.floor(Math.random() * 1000)
		};
		this.dispatchMutationUpdate();
	}

	/**
	 * Remove the object from the save data, and its assets from the save package.
	 * @param id id of the object to remove.
	 */
	public async removeObject(id: UUIDv4) {
		if (this.activeObject === id) {
			this.activeObject = null;
		}
		delete this.saveConfig.objects[id];
		renderer.scheduleRendererEvent({
			name: 'clear_single_object',
			payload: {
				id
			}
		});

		const assetsDelStatus = await invoke<number>('remove_assets_by_id', { id });
		switch (assetsDelStatus) {
			case 1:
				Log.save.warn("Assets dir doesn't exist, nothing to delete.");
				break;
			case 2:
				Log.save.error('Failed to properly delete assets of object ' + id);
				break;
		}

		this.dispatchMutationUpdate();
	}

	/**
	 * Clears all visual objects from the renderer and re-registers every object currently in the save.
	 *
	 * This should be used after loading a save file or when the set of objects needs to be fully synchronized
	 * with the renderer. It ensures that the renderer's state matches the current save configuration.
	 *
	 * Side effects:
	 * - Triggers a "clear_all_objects" event in the renderer, removing all currently registered objects.
	 * - Re-registers each object found in the save configuration.
	 * - Dispatches a mutation update to all subscribers.
	 */
	public reloadAllObjects() {
		renderer.scheduleRendererEvent({
			name: 'clear_all_objects',
			payload: null
		});
		for (const id of Object.keys(this.saveConfig.objects)) {
			renderer.scheduleRendererEvent({
				name: 'object_register',
				payload: {
					id: id as UUIDv4
				}
			});
		}
		this.dispatchMutationUpdate();
	}

	/**
	 * create an immutable copy of the active object data, mutate it with the provided mutator, and save it back
	 * @param mutator mutate the provided active object data in this function
	 * @returns
	 */
	public mutateActiveObject<T extends VisualObject>(mutator: (object: T) => T) {
		if (this.activeObjectData === null || this.activeObject === null) {
			throw new Error('No active object to mutate');
		}
		Log.save.log('Mutating active object with id ' + this.activeObject);
		renderer.scheduleRendererEvent({
			name: 'object_update',
			payload: {
				id: this.activeObject as UUIDv4
			}
		});
		this.saveConfig.objects[this.activeObject as UUIDv4] = mutator(
			typedDeepClone<T>(this.activeObjectData as T)
		);
		this.dispatchMutationUpdate();
	}

	private handlers: ((save: Save) => void)[] = [];

	public subscribeToMutations(callback: (save: Save) => void) {
		this.handlers.push(callback);
	}

	private dispatchMutationUpdate() {
		for (const handler of this.handlers) {
			handler(this.save);
		}
	}

	public async changeActiveObjectBackgroundImage(): Promise<string | null> {
		if (this.activeObject === null) {
			Log.save.warn('No active object to change background image of');
			return null;
		}
		const id = this.activeObject;
		const path = await open({
			title: 'Pick an image file',
			multiple: false,
			directory: false,
			recursive: false,
			filters: [{ extensions: ['jpg', 'jpeg', 'png', 'avif', 'webp', 'svg'], name: 'Image' }]
		});

		if (path === null) {
			Log.save.info('No file selected');
			return null;
		} else {
			try {
				const fileName = await invoke<string>('change_object_background_image', { path, id });
				Log.save.info('Object background image changed successfully');
				return fileName;
			} catch (e) {
				// Tauri errors are strings
				Log.save.error('Failed to change object background image: ' + e);
				return null;
			}
		}
	}
}

export const saveManager = new SaveManager();
