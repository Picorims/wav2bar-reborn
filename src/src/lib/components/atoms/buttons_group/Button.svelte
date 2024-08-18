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
