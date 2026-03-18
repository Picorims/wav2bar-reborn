<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import LabelWrapper from './LabelWrapper.svelte';

	interface Props {
		title?: string;
		children?: import('svelte').Snippet;
		noMargin?: boolean;
	}

	let { title = 'title', children, noMargin = false }: Props = $props();
</script>

{#if title !== ''}
	<LabelWrapper {title}>
		<div class="input">
			{@render children?.()}
		</div>
	</LabelWrapper>
{:else}
	<div class="input alone" class:noMargin>
		{@render children?.()}
	</div>
{/if}

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	div.input {
		@include g.div-input;
	}
	div.input.alone:not(.noMargin) {
		margin: g.$spacing-m 0;
	}
</style>
