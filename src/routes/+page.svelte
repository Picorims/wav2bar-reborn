<script lang="ts">
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
	import App from '$lib/components/window/App.svelte';
	import { settings } from '$lib/store/settings';
	import { ThemeOptions } from '$lib/store/settings_structure/settings_enums';
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
