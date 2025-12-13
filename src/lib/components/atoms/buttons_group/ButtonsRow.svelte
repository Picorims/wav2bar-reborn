<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	interface Props {
		/**
		 * Must be defined manually in the parent component.
		 */
		columns?: number;
		children?: import('svelte').Snippet;
	}

	let { columns = 1, children }: Props = $props();
</script>

<div class="row" style={`--columns-count: ${columns}`}>
	{@render children?.()}
</div>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.row {
		display: grid;
		grid-template-columns: repeat(var(--columns-count), 1fr);
		gap: g.$spacing-s;
		& > :global(*) {
			flex: 1 1 auto;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& > :global(button) {
			@include g.button-secondary;
		}
	}
</style>
