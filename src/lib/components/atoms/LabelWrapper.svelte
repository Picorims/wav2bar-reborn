<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		fixedLabelWidth?: boolean;
		children?: Snippet;
	}

	let { title, fixedLabelWidth = true, children }: Props = $props();
</script>

<label class="container">
	<span class="label" class:fixedLabelWidth>{title}:</span>
	{@render children?.()}
</label>

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	label.container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: g.$spacing-m 0;
	}

	span.label {
		@include g.text-small;
		flex: 0 1 auto;
		margin: g.$spacing-s 0;
		margin-right: g.$spacing-m;

		&.fixedLabelWidth {
			width: 40%;
			flex: 0 0 auto;
		}
	}
</style>
