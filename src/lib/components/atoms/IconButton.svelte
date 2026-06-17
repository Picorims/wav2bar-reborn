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
		tooltipDir?: 'top' | 'bottom';
	}

	let {
		onClick = () => {},
		variant = 'primary',
		children,
		togglable = false,
		toggled = false,
		onToggle = () => {},
		alt = '',
		disabled = false,
		tooltipDir = 'bottom'
	}: Props = $props();

	let showTooltip = $state(false);

	function handleClick() {
		showTooltip = false;
		onClick();
		if (togglable) {
			toggled = !toggled;
			onToggle(toggled);
		}
	}
</script>

<button
	onclick={() => handleClick()}
	onfocusin={() => (showTooltip = true)}
	onfocusout={() => (showTooltip = false)}
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
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
	{#if showTooltip && alt}
		<div class="tooltip" class:bottom={tooltipDir === 'bottom'} class:top={tooltipDir === 'top'}>
			<span>
				{alt}
			</span>
		</div>
	{/if}
</button>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;
	button.icon-button {
		position: relative;
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
	button.icon-button:disabled > :global(svg) {
		opacity: 0.5;
	}

	div.tooltip {
		position: absolute;
		top: 125%;
		left: 50%;
		transform: translate(-50%);
		padding: g.$spacing-s;
		border-radius: g.$border-radius-s;
		background-color: g.$color-background-200;
		color: #eee;
		z-index: 100000;
		animation: 0.1s ease-in-out showAnim;
	}
	div.tooltip.top {
		top: unset;
		bottom: 125%;
	}
	div.tooltip > span {
		position: relative;
		z-index: 100001;
	}
	div.tooltip::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		transform: rotate(45deg) translate(-50%);
		width: g.$size-xs;
		height: g.$size-xs;
		background-color: g.$color-background-200;
		z-index: 99999;
	}
	div.tooltip.top::before {
		top: calc(100% - 2px);
	}

	@keyframes showAnim {
		from {
			transform: scale(0.9) translate(-50%);
			opacity: 0;
		}
		to {
			transform: scale(1) translate(-50%);
			opacity: 1;
		}
	}
</style>
