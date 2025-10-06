/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Log } from "$lib/log/logger";
import { writable } from "svelte/store";

export enum ModalType {
    PROJECT_SETTINGS,
	SETTINGS,
}

export const currentModal = writable<ModalType | null>(null);

export function closeModal() {
    currentModal.set(null);
}

export const closeModalHandler = () => closeModal();

export function openModal(type: ModalType) {
    currentModal.set(type);
}

export function openModalHandler(type: ModalType) {
    return () => {Log.default.log("g"); openModal(type);}
}