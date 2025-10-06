/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { AudioProvider } from "$lib/engine/audio/audio_provider";

export abstract class TickUnit<T> {
    private _subscriptions: ((data: T) => void)[] = [];
    private _state: T;

    constructor(initState: T ) {
        this._state = initState;
    }

    subscribe(callback: (data: T) => void) {
        this._subscriptions.push(callback);
    }

    unsubscribe(callback: (data: T) => void) {
        this._subscriptions = this._subscriptions.filter(subscription => subscription !== callback);
    }

    private dispatchTick() {
        this._subscriptions.forEach(subscription => {
            subscription(this._state);
        });
    }

    public abstract getDefaultValue(): T
    protected abstract computeNewState(basis: T, audioProvider: AudioProvider | null): T

    public tick(audioProvider: AudioProvider | null) {
        this._state = this.computeNewState(this._state, audioProvider);
        this.dispatchTick();
    };
}