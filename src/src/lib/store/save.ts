import { derived, writable } from "svelte/store";
import type { UUIDv4 } from "$lib/types/common_types";
import * as zip from "@zip.js/zip.js";
import { validateAgainstRecord } from "$lib/types/validator";
import { defaultSaveConfig, saveValidator, type Save } from "./save_structure/save_latest";
import { LiveAudioProvider } from "$lib/engine/audio/live_audio_provider";

export const saveConfig = writable<Omit<Save, "objects">>(defaultSaveConfig());
export const saveObjects = writable<Save["objects"]>(defaultSaveConfig().objects);
export const activeObject = writable<UUIDv4 | null>(null);
export const activeObjectData = derived([saveObjects, activeObject], ([$saveObjects, $activeObject]) => {
    if ($activeObject === null) return null;
    return $saveObjects[$activeObject];
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