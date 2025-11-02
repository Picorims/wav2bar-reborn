/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { UUIDv4 } from "$lib/types/common_types";
// import { defaultSaveConfig, defaultVisualObject, type Save, type VisualObject, type VisualObject_Type } from "./save_structure/save_latest";
import { LiveAudioProvider } from "$lib/engine/audio/live_audio_provider";
import { typedDeepClone } from "$lib/deep_clone";
import { renderer, type Renderer } from "$lib/engine/video/renderer";
import { Log } from "$lib/log/logger";
import { validateSave, validateSaveVisualObject, type Save, type VisualObject, type VisualObject_Type } from "./save_structure/save_latest";
import { version } from "$app/environment";
import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";



class SaveManager {
    private _saveConfig = $state<Save>(this._getDefaultSave());
    private _saveObjects = $derived<Save["objects"]>(this._saveConfig.objects);
    public activeObject = $state<UUIDv4 | null>(null);

    get activeObjectData() {
        if (this.activeObject === null) return null;
        return this._saveObjects[this.activeObject];
    }

    get objectsCount() {
        return Object.keys(this._saveObjects).length;
    }

    get save() {
        return this._saveConfig;
    }

    private _getDefaultSave(): Save {
        const baseObject = {
            save_version: 4,
            software_version_used: version,
            software_version_first_created: version,
        }
        const validWithDefaults = validateSave(baseObject);
        if (!validWithDefaults) {
            throw new Error("Failed to create a default save because:\n\n" + validateSave.errors?.map((e) => `- ${e.instancePath} ${e.message}`).join("\n"));
        }
        // type is generated with the schema defaults,
        // and the TypeScript type originates from the same schema.
        // But TypeScript is not able to infer that here.
        return baseObject as unknown as Save;
    }

    private _getDefaultVisualObject(type: VisualObject_Type): VisualObject {
        const baseObject = {
            visual_object_type: type,
        }
        const validWithDefaults = validateSaveVisualObject(baseObject);
        if (!validWithDefaults) {
            throw new Error("Failed to create a default visual object because:\n\n" + validateSaveVisualObject.errors?.map((e) => `- ${e.instancePath} ${e.message}`).join("\n"));
        }
        // type is generated with the schema defaults,
        // and the TypeScript type originates from the same schema.
        // But TypeScript is not able to infer that here.
        return baseObject as unknown as VisualObject;
    }

    public async openSave(renderer: Renderer) {
        Log.save.info("Asking for a file to open");
        const path = await open({
            title: "Pick a save file",
            multiple: false,
            directory: false,
            recursive: false,
            filters: [{extensions: ["w2bzip"], name: "Wav2Bar save file"}],
        })

        if (path === null) {
            Log.save.info("No file selected");
            return;
        } else {
            try {
                await invoke("open_save", { path: path as string });
                Log.save.info("Save file opened successfully, reading JSON...");
                const jsonStr = await invoke<string>("read_save_json");
                Log.save.info("Read JSON from save file, parsing it...");
                const saveJSON = JSON.parse(jsonStr);
                Log.save.info("Validating save file...");
                const valid = validateSave(saveJSON);
                if (!valid) {
                    throw new Error("Save file does not match the schema because:\n\n" + validateSave.errors?.map((e) => `- ${e.instancePath} ${e.message}`).join("\n"));
                } else {
                    Log.save.info("Save file is valid, loading it");
                    this._saveConfig = saveJSON as unknown as Save;

                    renderer.setAudioProvider(new LiveAudioProvider());        
                }

            } catch (e) {
                Log.save.error("Failed to open save file: " + (e as Error).message);
                return;
            }
        }
    }
    
    public async saveToFile() {
        Log.save.info("Asking for a file to save to");
        const path = await save({
            title: "Pick a file to save to",
            filters: [{extensions: ["w2bzip"], name: "Wav2Bar save file"}],
            defaultPath: "project.w2bzip",
        })

        if (path === null) {
            Log.save.info("No file selected");
            return;
        } else {
            try {
                await invoke("save_to_file", { pathStr: path });
                Log.save.info("Save file saved successfully");
            } catch (e) {
                Log.save.error("Failed to save file: " + e);
                return;
            }
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
            name: "object_register",
            payload: {
                id: uuid,
            }
        });
        this._saveConfig.objects[uuid] = {
            ...this._getDefaultVisualObject(type),
            name: type + "_" + Math.floor(Math.random() * 1000),
        };
        this._dispatchMutationUpdate();
    }

    /**
     * create an immutable copy of the active object data, mutate it with the provided mutator, and save it back
     * @param mutator mutate the provided active object data in this function
     * @returns 
     */
    public mutateActiveObject<T extends VisualObject>(mutator: (object: T) => T) {
        if (this.activeObjectData === null || this.activeObject === null) {
            throw new Error("No active object to mutate");
        };
        renderer.scheduleRendererEvent({
            name: "object_update",
            payload: {
                id: this.activeObject as UUIDv4,
            }
        })
        this._saveConfig.objects[this.activeObject as UUIDv4] = mutator(typedDeepClone<T>(this.activeObjectData as T));
        this._dispatchMutationUpdate();
    }

    private _handlers: ((save: Save) => void)[] = [];

    public subscribeToMutations(callback: (save: Save) => void) {
        this._handlers.push(callback);
    }

    private _dispatchMutationUpdate() {
        for (const handler of this._handlers) {
            handler(this.save);
        }
    }
}

export const saveManager = new SaveManager();
