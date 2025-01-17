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

	import { MoveVertical, XCircle } from 'lucide-svelte';
	import LabeledInputWrapper from './LabeledInputWrapper.svelte';

	export let title: string = '';
	export let unit: string = '';
	export let onChange: (value: number) => void = () => {};

	// forwards =====
	export let placeholder: string = '';
	export let min: number = -Infinity;
	export let max: number = Infinity;
	export let step: number = 1;
	export let disabled: boolean = false;
	export let required: boolean = true;
	// =====
	export let defaultValue: number = 0;
	export let value: number = defaultValue;
	let lastValidValue: number = value;

	let input: HTMLInputElement;
	let valid = true;
	$: value, input && checkValidity();

	const doNotLetInInvalidState = () => {
		if (!valid) input.value = (lastValidValue ?? defaultValue).toString();
	};

	const checkValidity = () => {
		valid = input.checkValidity();
		if (valid) lastValidValue = value;
	};
	const handleOnChange = (e: Event) => {
		checkValidity();
		if (valid) onChange(value);
	};
</script>

<LabeledInputWrapper {title}>
	<input
		bind:value
		bind:this={input}
		type="number"
		on:change={handleOnChange}
		on:input={checkValidity}
		on:focusout={doNotLetInInvalidState}
		{placeholder}
		{min}
		{max}
		{step}
		{disabled}
		{required}
	/>
	{#if unit}
		<span class="unit">{unit}</span>
	{/if}
	{#if valid}
		<MoveVertical size={16} />
	{:else}
		<XCircle size={16} />
	{/if}
</LabeledInputWrapper>
