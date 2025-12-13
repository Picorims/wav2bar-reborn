<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import { XCircle } from 'lucide-svelte';
	import LabeledInputWrapper from './LabeledInputWrapper.svelte';


	interface Props {
		title?: string;
		onChange?: (value: string) => void;
		// forwards =====
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		pattern?: RegExp;
		// =====
		defaultValue?: string;
		value?: string;
	}

	let {
		title = '',
		onChange = () => {},
		placeholder = '',
		disabled = false,
		required = true,
		pattern = /.+/g,
		defaultValue = "",
		value = $bindable(defaultValue)
	}: Props = $props();
	let lastValidValue: string = value;

	let input: HTMLInputElement | undefined = $state();
	let valid = $state(true);

	const doNotLetInInvalidState = () => {
		if (!valid && input) input.value = (lastValidValue ?? defaultValue).toString();
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
		type="color"
		onchange={handleOnChange}
		oninput={checkValidity}
		onfocusout={doNotLetInInvalidState}
		{placeholder}
		{disabled}
		{required}
		pattern={pattern.source}
	/>
	{#if !valid}
		<XCircle size={16} />
	{/if}
</LabeledInputWrapper>
