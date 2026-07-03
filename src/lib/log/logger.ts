/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { nowUTCString } from '$lib/date';

import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

/**
 * overrides a default console function, by logging it
 * and forwarding it to a tauri plugin.
 * @see https://v2.tauri.app/plugin/logging/
 * @param fnName
 * @param logger
 */
function forwardConsole(
	fnName: 'log' | 'debug' | 'info' | 'warn' | 'error' | 'trace',
	logger: (message: string) => Promise<void>
) {
	const original = console[fnName];
	console[fnName] = (...args) => {
		const message = args.map((args) => args.toString()).join(' ');
		original(message);
		if (typeof message !== 'string') {
			original('Logger: message is not a string, ignoring it.');
			return;
		}
		logger(message);
	};
}

if (typeof window !== 'undefined') {
	forwardConsole('log', debug);
	forwardConsole('trace', trace);
	forwardConsole('debug', debug);
	forwardConsole('info', info);
	forwardConsole('warn', warn);
	forwardConsole('error', error);
}

class Logger {
	private namespace: string;
	constructor(namespace: string = 'default') {
		this.namespace = namespace;
	}

	private prefix(level: string) {
		return `[${nowUTCString()}] [${this.namespace}] [${level}] -`;
	}

	trace(...messages: string[]) {
		console.trace(`${this.prefix('trace')} ${messages.join(' ')}`);
	}
	debug(...messages: string[]) {
		console.debug(`${this.prefix('debug')} ${messages.join(' ')}`);
	}
	info(...messages: string[]) {
		console.info(`${this.prefix('info')} ${messages.join(' ')}`);
	}
	warn(...messages: string[]) {
		console.warn(`${this.prefix('warn')} ${messages.join(' ')}`);
	}
	error(...messages: string[]) {
		console.error(`${this.prefix('error')} ${messages.join(' ')}`);
	}
	fatal(...messages: string[]) {
		console.error(`${this.prefix('fatal')} ${messages.join(' ')}`);
	}
	log(...messages: string[]) {
		this.debug(...messages);
	}
}

export const Log = {
	default: new Logger(),
	renderer: new Logger('renderer'),
	audio: new Logger('audio'),
	video: new Logger('ticker'),
	save: new Logger('save'),
	ui: new Logger('ui'),
	export: new Logger('export')
};

if (typeof window !== 'undefined') {
	window.addEventListener('error', (event) => {
		Log.default.error(event.message);
	});
}
