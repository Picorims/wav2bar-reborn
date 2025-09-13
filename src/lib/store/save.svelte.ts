import type { UUIDv4 } from "$lib/types/common_types";
import * as zip from "@zip.js/zip.js";
import Ajv from "ajv";
import { defaultSaveConfig, defaultVisualObject, type Save, type VisualObject, type VisualObject_Type } from "./save_structure/save_latest";
import { LiveAudioProvider } from "$lib/engine/audio/live_audio_provider";
import { typedDeepClone } from "$lib/deep_clone";
import { renderer, type Renderer } from "$lib/engine/video/renderer";
import { Log } from "$lib/log/logger";
import saveV4Schema from "$lib/schemas/save_v4.json";
import type { Save_V4 } from "./save_structure/save_v4";


// Check package.json - "npm run json2ts" script to update the types associated to JSON schemas.

const ajv = new Ajv({useDefaults: true});
const validateSaveV4 = ajv.compile(saveV4Schema);

class SaveManager {
    private _saveConfig = $state<Save>(defaultSaveConfig());
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

    public openSave(renderer: Renderer) {
        Log.save.info("Asking for a file to open");
        const fileElt = document.createElement("input");
        fileElt.type = "file";
        fileElt.accept = ".w2bzip";
        fileElt.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            Log.save.info("Opening save file");
            // https://gildas-lormeau.github.io/zip.js/
            const blobReader = new zip.BlobReader(file);
            const reader = new zip.ZipReader(blobReader);
            const entries = await reader.getEntries();
            const saveEntry = entries.find((entry) => entry.filename === "data.json");
            if (saveEntry === undefined) {
                throw new Error("No save.json file found in the zip");
            } else {
                const saveString = await saveEntry.getData!(new zip.TextWriter());
                const saveJSON = JSON.parse(saveString);
                Log.save.info("Save file opened", JSON.stringify(saveJSON));
                const valid = validateSaveV4(saveJSON);
                if (!valid) {
                    throw new Error("Save file does not match the schema because:\n\n" + validateSaveV4.errors?.map((e) => `- ${e.instancePath} ${e.message}`).join("\n"));
                } else {
                    Log.save.info("Save file is valid, loading it");
                    this._saveConfig = saveJSON as unknown as Save_V4;
    
                    renderer.setAudioProvider(new LiveAudioProvider());        
                }
            }
    
        };
        fileElt.click();
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
            ...defaultVisualObject(type),
            name: type + "_" + Math.floor(Math.random() * 1000),
        };
        this.dispatchMutationUpdate();
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
        this.dispatchMutationUpdate();
    }

    private _handlers: ((save: Save) => void)[] = [];

    public subscribeToMutations(callback: (save: Save) => void) {
        this._handlers.push(callback);
    }

    private dispatchMutationUpdate() {
        for (const handler of this._handlers) {
            handler(this.save);
        }
    }
}

export const saveManager = new SaveManager();
