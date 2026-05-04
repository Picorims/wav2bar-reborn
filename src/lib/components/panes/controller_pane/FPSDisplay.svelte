<script lang="ts">
	import { renderer } from '$lib/engine/video/renderer';
	import { onMount } from 'svelte';

	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/

	let rendererFps = $state(0);
	let simulationTps = $state(0);
	let interval = $state<ReturnType<typeof setInterval> | null>(null);
	const REFRESH_INTERVAL_MS = 500;

	onMount(() => {
		interval = setInterval(() => {
			rendererFps = Math.round(renderer.getPerfFPS());
			simulationTps = Math.round(renderer.getPerfTPS());
		}, REFRESH_INTERVAL_MS);
		return () => {
			if (interval !== null) {
				clearInterval(interval);
			}
		};
	});
</script>

<span class="fps">{rendererFps} FPS | {simulationTps} TPS</span>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	.fps {
		@include g.text;
		color: g.$color-text-800;
	}
</style>
