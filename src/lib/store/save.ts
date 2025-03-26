import type { UUIDv4 } from "$lib/types/common_types";
import * as zip from "@zip.js/zip.js";
import { validateAgainstRecord } from "$lib/types/validator";
import { defaultSaveConfig, defaultVisualObject, saveValidator, type Save, type VisualObject, type VisualObject_Type } from "./save_structure/save_latest";
import { LiveAudioProvider } from "$lib/engine/audio/live_audio_provider";
import { typedDeepClone } from "$lib/deep_clone";
import { renderer, type Renderer } from "$lib/engine/video/renderer";
import { Log } from "$lib/log/logger";

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
                Log.save.info("Save file opened", saveJSON);
                const validation = validateAgainstRecord(saveJSON, saveValidator);
                if (!validation.success) {
                    throw new Error("Save file does not match the schema because:\n\n" + validation.logs);
                } else {
                    Log.save.info("Save file is valid, loading it");
                    this._saveConfig = saveJSON;
    
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
    }
}

export const saveManager = new SaveManager();

// export const saveConfig = writable<Omit<Save, "objects">>(defaultSaveConfig());
// export const saveObjects = writable<Save["objects"]>(defaultSaveConfig().objects);



// export const activeObject = writable<UUIDv4 | null>(null);
// /**
//  * serves as activeObject getter
//  */
// let activeObjectValue: UUIDv4 | null = null;
// activeObject.subscribe(value => { activeObjectValue = value; });



// export const activeObjectData = derived([saveObjects, activeObject], ([$saveObjects, $activeObject]) => {
//     if ($activeObject === null) return null;
//     return $saveObjects[$activeObject];
// });
// /**
//  * serves as activeObjectData getter
//  */
// let activeObjectDataValue: VisualObject | null = null;
// activeObjectData.subscribe(value => { activeObjectDataValue = value; });



// export const objectsCount = derived(saveObjects, ($saveObjects) => Object.keys($saveObjects).length);
// // /**
// //  * serves as objectsCount getter
// //  */
// // export let objectsCountValue = 0;
// // objectsCount.subscribe(value => {
// //     objectsCountValue = value;
// // });



// export const save = derived([saveConfig, saveObjects], ([$saveConfig, $saveObjects]) => {
//     return {
//         ...$saveConfig,
//         objects: $saveObjects,
//     };
// });



// export function openSave(renderer: Renderer) {
//     Log.save.info("Asking for a file to open");
//     const fileElt = document.createElement("input");
//     fileElt.type = "file";
//     fileElt.accept = ".w2bzip";
//     fileElt.onchange = async (e) => {
//         const file = (e.target as HTMLInputElement).files?.[0];
//         if (!file) return;
//         Log.save.info("Opening save file");
//         // https://gildas-lormeau.github.io/zip.js/
//         const blobReader = new zip.BlobReader(file);
//         const reader = new zip.ZipReader(blobReader);
//         const entries = await reader.getEntries();
//         const saveEntry = entries.find((entry) => entry.filename === "data.json");
//         if (saveEntry === undefined) {
//             throw new Error("No save.json file found in the zip");
//         } else {
//             const saveString = await saveEntry.getData!(new zip.TextWriter());
//             const saveJSON = JSON.parse(saveString);
//             Log.save.info("Save file opened", saveJSON);
//             const validation = validateAgainstRecord(saveJSON, saveValidator);
//             if (!validation.success) {
//                 throw new Error("Save file does not match the schema because:\n\n" + validation.logs);
//             } else {
//                 Log.save.info("Save file is valid, loading it");
//                 saveConfig.set(saveJSON as Omit<Save, "objects">);
//                 saveObjects.set(saveJSON.objects);

//                 renderer.setAudioProvider(new LiveAudioProvider());        
//             }
//         }

//     };
//     fileElt.click();
// }

// /**
//  * Adds a new object to the save from the given type
//  * with default values
//  * @param type 
//  */
// export function addObject(type: VisualObject_Type) {
//     /* TODO: undo/redo */
//     const uuid: UUIDv4 = self.crypto.randomUUID() as UUIDv4;
//     if (objectsCountValue === 0) {
//         activeObject.set(uuid);
//     }
//     renderer.scheduleRendererEvent({
//         name: "object_register",
//         payload: {
//             id: uuid,
//         }
//     });
//     saveObjects.update((objects) => {
//         return {
//             ...objects,
//             [uuid]: {
//                 ...defaultVisualObject(type),
//                 name: type + "_" + Math.floor(Math.random() * 1000),
//             },
//         }
//     });
// }

// /**
//  * create an immutable copy of the active object data, mutate it with the provided mutator, and save it back
//  * @param mutator mutate the provided active object data in this function
//  * @returns 
//  */
// export function mutateActiveObject<T extends VisualObject>(mutator: (object: T) => T) {
//     if (activeObjectDataValue === null) {
//         throw new Error("No active object to mutate");
//     };
//     renderer.scheduleRendererEvent({
//         name: "object_update",
//         payload: {
//             id: activeObjectValue as UUIDv4,
//         }
//     })
//     saveObjects.update((objects) => {
//         return {
//             ...objects,
//             [activeObjectValue as string]: mutator(typedDeepClone<T>(activeObjectDataValue as T)),
//         };
//     });
// }