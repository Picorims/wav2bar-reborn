<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="container">
	{@render children?.()}
</div>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.container {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: g.$spacing-s;
	}
</style>
