import { writable } from "svelte/store";

export enum ModalType {
    PROJECT_SETTINGS,
}

export const currentModal = writable<ModalType | null>(null);