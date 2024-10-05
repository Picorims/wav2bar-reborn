/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (C) 2024  Picorims <picorims.contact@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
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