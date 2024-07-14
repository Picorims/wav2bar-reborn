import { derived, writable } from "svelte/store";
import { defaultSaveConfig_V4, type Save_V4 } from "./save_structure/save_v4";
import type { UUIDv4 } from "$lib/types/common_types";

export const saveConfig = writable<Omit<Save_V4, "objects">>(defaultSaveConfig_V4());
export const saveObjects = writable<Save_V4["objects"]>(defaultSaveConfig_V4().objects);
export const activeObject = writable<UUIDv4 | null>(null);
export const activeObjectData = derived([saveObjects, activeObject], ([$saveObjects, $activeObject]) => {
    if ($activeObject === null) return null;
    return $saveObjects[$activeObject];
});