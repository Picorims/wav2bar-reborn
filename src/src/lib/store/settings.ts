import { writable } from "svelte/store";
import lang_EN from "$lib/lang/en.json";
import type { SettingsV2 } from "./settings_structure/settings_v2";
import { defaultSettingsV2 } from "./settings_structure/settings_v2";
import { LanguageOptions } from "./settings_structure/settings_enums";

export type Language = typeof lang_EN;

export const languages = {
    [LanguageOptions.ENGLISH]: lang_EN,
};

export const lang = writable<Language>(languages[LanguageOptions.ENGLISH]);

export const settings = writable<SettingsV2>({...defaultSettingsV2});

settings.subscribe((value) => {
    lang.set(languages[value.language]);
});
