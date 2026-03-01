<script lang="ts">
	import { BadgeCheck, Info, OctagonX, TriangleAlert } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors
    
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	interface Props {
		type: 'info' | 'warning' | 'error' | 'success';
		children: Snippet;
	}

	let { type = 'info', children }: Props = $props();
	let info = $derived<boolean>(type === 'info');
	let warning = $derived<boolean>(type === 'warning');
	let error = $derived<boolean>(type === 'error');
	let success = $derived<boolean>(type === 'success');
</script>

<div class="callout" class:info class:warning class:error class:success>
	<div class="icon">
		{#if info}
			<Info />
		{:else if warning}
			<TriangleAlert />
		{:else if error}
			<OctagonX />
		{:else if success}
			<BadgeCheck />
		{/if}
	</div>
	{@render children()}
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	div.callout.info {
		--color: #{g.$color-status-info};
	}
	div.callout.warning {
		--color: #{g.$color-status-warning};
	}
	div.callout.error {
		--color: #{g.$color-status-error};
	}
	div.callout.success {
		--color: #{g.$color-status-success};
	}

	div.callout {
		width: 100%;
		padding: g.$spacing-m;
		margin: g.$spacing-m 0;
		border: g.$size-5xs solid var(--color);
		border-left: g.$size-2xs solid var(--color);
		border-radius: g.$border-radius-m;
		background-color: rgb(from var(--color) r g b / 0.3);

		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: g.$spacing-m;

		.icon {
			color: var(--color);
		}
	}
</style>
