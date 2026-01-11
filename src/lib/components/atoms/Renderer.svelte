<script lang="ts">
	import { renderer } from '$lib/engine/video/renderer';
	import { onDestroy, onMount } from 'svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import { onZoomChanged } from '$lib/store/app_state.svelte';

	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	let canvas: HTMLCanvasElement | undefined;
	let unsubscribeFromZoom: () => void = $state(() => {});

	onMount(async () => {
		await renderer.init(
			saveManager.resolution.width,
			saveManager.resolution.height,
			saveManager.fps
		);
		canvas = renderer.getCanvas();
		document.getElementById('pixi-canvas-div')?.appendChild(canvas);
		unsubscribeFromZoom = onZoomChanged((newZoom) => {
			if (!canvas) return;
			canvas.style.width = `${(saveManager.resolution.width * newZoom) / 100}px`;
			canvas.style.height = `${(saveManager.resolution.height * newZoom) / 100}px`;
		});
	});
	onDestroy(() => {
		// can't go in onMount's return because that one is async
		unsubscribeFromZoom();
	});
</script>

<div id="pixi-canvas-div"></div>

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;
	#pixi-canvas-div {
		$margin: (g.$spacing-l);
		$size: calc(100% - 2 * $margin);
		width: $size;
		max-width: $size;
		height: $size;
		max-height: $size;
		margin: $margin;
		display: flex;

		align-items: flex-start;
		justify-content: flex-start;
		// see: https://stackoverflow.com/questions/33454533/cant-scroll-to-top-of-flex-item-that-is-overflowing-container
		// justify-content: center; // makes part of the canvas inaccessible if it is bigger than the container.
		// solution
		@supports (justify-content: safe center) {
			align-items: safe center;
			justify-content: safe center;
		}
		overflow: auto;
	}
</style>
