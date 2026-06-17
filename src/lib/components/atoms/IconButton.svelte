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
		onClick?: () => void;
		variant?: 'primary' | 'secondary' | 'accent';
		children?: Snippet;
		togglable?: boolean;
		toggled?: boolean;
		onToggle?: (value: boolean) => void;
		alt?: string;
		disabled?: boolean;
	}

	let {
		onClick = () => {},
		variant = 'primary',
		children,
		togglable = false,
		toggled = false,
		onToggle = () => {},
		alt = '',
		disabled = false
	}: Props = $props();

	function handleClick() {
		onClick();
		if (togglable) {
			toggled = !toggled;
			onToggle(toggled);
		}
	}
</script>

<button
	onclick={() => handleClick()}
	type="button"
	role={togglable ? 'switch' : 'button'}
	aria-checked={togglable ? toggled : undefined}
	aria-label={alt}
	title={alt}
	class={`icon-button ${variant}`}
	class:toggled={togglable && toggled}
	{disabled}
>
	{@render children?.()}
</button>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;
	button.icon-button {
		width: g.$size-m;
		height: g.$size-m;
		background: none;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition: g.$anim-fast;
		border-radius: g.$border-radius-s;
	}

	button.icon-button.accent > :global(svg) {
		stroke: g.$color-accent;
	}

	button.icon-button:hover > :global(svg) {
		transition: g.$anim-fast;
	}
	button.icon-button.primary:hover > :global(svg),
	button.icon-button.toggled.primary > :global(svg) {
		stroke: g.$color-primary-500;
	}
	button.icon-button.secondary:hover > :global(svg),
	button.icon-button.toggled.secondary > :global(svg) {
		stroke: g.$color-secondary-500;
	}
	button.icon-button.accent:hover > :global(svg),
	button.icon-button.toggled.accent > :global(svg) {
		stroke: g.$color-accent-700;
	}

	button.icon-button:active,
	button.icon-button.toggled {
		transform: scale(0.95);
	}
	button.icon-button.primary.toggled {
		border: 2px solid g.$color-primary-500;
	}
	button.icon-button.secondary.toggled {
		border: 2px solid g.$color-secondary-500;
	}
	button.icon-button.accent.toggled {
		border: 2px solid g.$color-accent-700;
	}
	button.icon-button.toggled:focus-visible {
		border-width: 4px;
	}

	button.icon-button > :global(svg) {
		width: 24px;
		height: 24px;
		stroke: g.$color-background-950;
	}
	button.icon-button:disabled {
		opacity: 0.5;
	}
</style>
