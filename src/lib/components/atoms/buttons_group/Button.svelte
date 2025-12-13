<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	export let togglable = false;
	export let toggled = false;
	export let onClick: () => void = () => {};
	export let onToggle: (value: boolean) => void = () => {};
	export let disabled = false;
	export let label: string | null = null;
	export let title: string | null = label;
	let clientWidth: number;

	/* TODO: primary, secondary, accent modes */

	function handleClick() {
		onClick();
		if (togglable) {
			toggled = !toggled;
			onToggle(toggled);
		}
	}
</script>

<button
	bind:clientWidth
	on:click={handleClick}
	{disabled}
	type="button"
	role={togglable ? 'switch' : 'button'}
	aria-checked={togglable ? toggled : undefined}
	aria-label={label ?? title}
	{title}
	class:toggled
>
	<slot name="icon-l" />
	{#if label}
		<span>{label}</span>
	{/if}
	{#if label === null && title !== null && clientWidth > 100}
		<span>{title}</span>
	{/if}
	<slot name="icon-r" />
</button>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	button {
		@include g.button-secondary;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: g.$spacing-s;

		& > :global(*) {
			flex: 0 0 auto;
		}
		& > span {
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			text-wrap: nowrap;
		}
	}
</style>
