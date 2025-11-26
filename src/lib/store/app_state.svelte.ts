/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

interface AppState {
    loading: boolean;
    loadingInfo: string;
    loadingInfoDetail: string;
    loadingProgress: number | null;
}

export const appState = $state<AppState>({
    loading: false,
    loadingInfo: "",
    loadingInfoDetail: "",
    loadingProgress: null,
});
/**
 * Also resets loading info to empty string.
 * @param value 
 */
export function setLoading(value: boolean) {
    appState.loading = value;
    appState.loadingInfo = "";
    appState.loadingInfoDetail = "";
    appState.loadingProgress = null;
}
/**
 * Also resets loading detail to empty string.
 * @param info 
 */
export function setLoadingInfo(info: string) {
    appState.loadingInfo = info;
    appState.loadingInfoDetail = "";
    appState.loadingProgress = null;
}
export function setLoadingInfoDetail(detail: string) {
    appState.loadingInfoDetail = detail;
}
export function setLoadingProgress(progress: number | null) {
    appState.loadingProgress = progress;
}