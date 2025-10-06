/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;
/**
 * @see https://svelte.dev/docs/kit/single-page-apps
 */
export const ssr = false; 

import "$lib/css/global.scss";

// === done through @use and @forward, hence the commented imports below vvvvvv

// import * as vr from "$lib/css/variables.scss";
// import * as mx from "$lib/css/mixins.scss";

// ===