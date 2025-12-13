<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import App from '$lib/components/window/App.svelte';
	import { settings } from '$lib/store/settings';
	import { onMount } from 'svelte';

	onMount(() => {
		settings.subscribe((value) => {
			document.body.className = `theme-${value.theme.toLowerCase()}`;
		});
	});
</script>

<App />

<style lang="scss">
	@use '../lib/css/globals_forward.scss' as g;
	// !!!!!!!!!!!!!!!!!!!!!!!!
	// IMPORTANT NOTE: :global() prevents the selector from being stripped down if unused
	// !!!!!!!!!!!!!!!!!!!!!!!!

	:global(body.theme-default) {
		@include g.theme-dark;
	}
	:global(body.theme-light) {
		@include g.theme-light;
	}
	:global(body.theme-dark) {
		@include g.theme-dark;
	}
</style>
