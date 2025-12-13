<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
	const handleOnChange = () => {
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
