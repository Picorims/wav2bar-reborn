import { derived, writable } from "svelte/store";
import { defaultSaveConfig_V4, saveValidator_V4, type Save_V4 } from "./save_structure/save_v4";
import type { UUIDv4 } from "$lib/types/common_types";
import * as zip from "@zip.js/zip.js";
import { validateAgainstRecord } from "$lib/types/validator";

export const saveConfig = writable<Omit<Save_V4, "objects">>(defaultSaveConfig_V4());
export const saveObjects = writable<Save_V4["objects"]>(defaultSaveConfig_V4().objects);
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
            const validation = validateAgainstRecord(saveJSON, saveValidator_V4);
            if (!validation.success) {
                throw new Error("Save file does not match the schema because:\n\n" + validation.logs);
            } else {
                console.log("Save file is valid, loading it");
                saveConfig.set(saveJSON as Omit<Save_V4, "objects">);
                saveObjects.set(saveJSON.objects);
            }
        }

    };
    fileElt.click();
}