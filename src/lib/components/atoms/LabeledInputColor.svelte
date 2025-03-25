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
