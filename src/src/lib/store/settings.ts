import { writable } from "svelte/store";
import lang_EN from "$lib/lang/en.json";

export type Language = typeof lang_EN;

export enum LanguageOptions {
    ENGLISH = "en",
}

export const languages = {
    [LanguageOptions.ENGLISH]: lang_EN,
};

export const selectedLanguage = writable<LanguageOptions>(LanguageOptions.ENGLISH);

export const lang = writable<Language>(languages[LanguageOptions.ENGLISH]);

selectedLanguage.subscribe((value) => {
    lang.set(languages[value]);
});