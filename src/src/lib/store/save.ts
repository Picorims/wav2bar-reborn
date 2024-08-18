import { derived, writable } from "svelte/store";
import type { JsonLike, UUIDv4 } from "$lib/types/common_types";
import * as zip from "@zip.js/zip.js";
import { validateAgainstRecord } from "$lib/types/validator";
import { defaultSaveConfig, defaultVisualObject, saveValidator, type Save, type VisualObject, type VisualObject_Type, type VisualObjectInterface } from "./save_structure/save_latest";
import { LiveAudioProvider } from "$lib/engine/audio/live_audio_provider";
import { typedDeepClone } from "$lib/deep_clone";

export const saveConfig = writable<Omit<Save, "objects">>(defaultSaveConfig());
export const saveObjects = writable<Save["objects"]>(defaultSaveConfig().objects);
export const activeObject = writable<UUIDv4 | null>(null);
let activeObjectValue: UUIDv4 | null = null;
activeObject.subscribe(value => { activeObjectValue = value; });
export const activeObjectData = derived([saveObjects, activeObject], ([$saveObjects, $activeObject]) => {
    if ($activeObject === null) return null;
    return $saveObjects[$activeObject];
});
let activeObjectDataValue: VisualObject | null = null;
activeObjectData.subscribe(value => { activeObjectDataValue = value; });
export const objectsCount = derived(saveObjects, ($saveObjects) => Object.keys($saveObjects).length);
export let objectsCountValue = 0;
objectsCount.subscribe(value => {
    objectsCountValue = value;
});
export const save = derived([saveConfig, saveObjects], ([$saveConfig, $saveObjects]) => {
    return {
        ...$saveConfig,
        objects: $saveObjects,
    };
});

export function openSave() {
    console.log("Asking for a file to open");
    const fileElt = document.createElement("input");
    fileElt.type = "file";
    fileElt.accept = ".w2bzip";
    fileElt.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        console.log("Opening save file");
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
            console.log("Save file opened", saveJSON);
            const validation = validateAgainstRecord(saveJSON, saveValidator);
            if (!validation.success) {
                throw new Error("Save file does not match the schema because:\n\n" + validation.logs);
            } else {
                console.log("Save file is valid, loading it");
                saveConfig.set(saveJSON as Omit<Save, "objects">);
                saveObjects.set(saveJSON.objects);

                const liveAudioProvider = new LiveAudioProvider();
                liveAudioProvider.init();
                setInterval(() => {
                    console.log(liveAudioProvider.getCurrentAudioSpectrum());
                }, 1000);        
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
export function addObject(type: VisualObject_Type) {
    /* TODO: undo/redo */
    const uuid: UUIDv4 = self.crypto.randomUUID() as UUIDv4;
    if (objectsCountValue === 0) {
        activeObject.set(uuid);
    }
    saveObjects.update((objects) => {
        return {
            ...objects,
            [uuid]: {
                ...defaultVisualObject(type),
                name: type + "_" + Math.floor(Math.random() * 1000),
            },
        }
    });
}

/**
 * create an immutable copy of the active object data, mutate it with the provided mutator, and save it back
 * @param mutator mutate the provided active object data in this function
 * @returns 
 */
export function mutateActiveObject<T extends VisualObject>(mutator: (object: T) => T) {
    if (activeObjectDataValue === null) {
        throw new Error("No active object to mutate");
    };
    saveObjects.update((objects) => {
        return {
            ...objects,
            [activeObjectValue as string]: mutator(typedDeepClone<T>(activeObjectDataValue as T)),
        };
    });
}