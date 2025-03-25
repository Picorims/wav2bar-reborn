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


	interface Props {
		title?: string;
		unit?: string;
		onChange?: (value: number) => void;
		// forwards =====
		placeholder?: string;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		required?: boolean;
		// =====
		defaultValue?: number;
		value?: number;
	}

	let {
		title = '',
		unit = '',
		onChange = () => {},
		placeholder = '',
		min = -Infinity,
		max = Infinity,
		step = 1,
		disabled = false,
		required = true,
		defaultValue = 0,
		value = $bindable(defaultValue)
	}: Props = $props();
	let lastValidValue: number = value;

	let input: HTMLInputElement | undefined = $state();
	let valid = $state(true);

	const doNotLetInInvalidState = () => {
		if (!input) return;
		if (!valid) input.value = (lastValidValue ?? defaultValue).toString();
	};

	const checkValidity = () => {
		if (!input) return;
		valid = input.checkValidity();
		if (valid) lastValidValue = value;
	};
	const handleOnChange = (e: Event) => {
		checkValidity();
		if (valid) onChange(value);
	};
	$effect(() => {
		checkValidity();
	});
</script>

<LabeledInputWrapper {title}>
	<input
		bind:value
		bind:this={input}
		type="number"
		onchange={handleOnChange}
		oninput={checkValidity}
		onfocusout={doNotLetInInvalidState}
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
