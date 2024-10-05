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

import { nowUTCString } from "$lib/date";

class Logger {
    private _namespace: string;
    constructor(namespace: string = "default") {
        this._namespace = namespace;
    }

    private _prefix(level: string) {
        return `[${nowUTCString()}] [${this._namespace}] [${level}] -`;
    }

    trace(...messages: string[]) {
        console.trace(`${this._prefix("trace")} ${messages.join(" ")}`);
    }
    debug(...messages: string[]) {
        console.debug(`${this._prefix("debug")} ${messages.join(" ")}`);
    }
    info(...messages: string[]) {
        console.info(`${this._prefix("info")} ${messages.join(" ")}`);
    }
    warn(...messages: string[]) {
        console.warn(`${this._prefix("warn")} ${messages.join(" ")}`);
    }
    error(...messages: string[]) {
        console.error(`${this._prefix("error")} ${messages.join(" ")}`);
    }
    fatal(...messages: string[]) {
        console.error(`${this._prefix("fatal")} ${messages.join(" ")}`);
    }
    log(...messages: string[]) {
        this.debug(...messages);
    }
}

export const Log = {
    default: new Logger(),
    renderer: new Logger("renderer"),
    audio: new Logger("audio"),
    video: new Logger("ticker"),
    save: new Logger("save"),
    ui: new Logger("ui"),
}

if (window) {
    window.addEventListener("error", (event) => {
        Log.default.error(event.message);
    });
}