<script lang="ts" generics="Options extends Record<string, string>">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import LabelWrapper from './LabelWrapper.svelte';

	interface Props {
		optionsArr?: string[] | null;
		// optionsObj?: Record<string, string> | null;
		// eslint-disable-next-line no-undef
		optionsObj?: Options | null;
		title?: string;
		// eslint-disable-next-line no-undef
		onChange?: (key: keyof Options) => void;
		onFocusChange?: (focused: boolean) => void;
		value?: string;
		noMargin?: boolean;
	}

	let {
		optionsArr = null,
		optionsObj = null,
		title = '',
		onChange = () => {},
		onFocusChange = () => {},
		value = $bindable(''),
		noMargin = false
	}: Props = $props();

	const handleOnChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		onChange(select.value);
	};

	let options: { key: string; value: string }[] = $derived.by(() => {
		const entries: { key: string; value: string }[] = [];
		if (optionsArr) {
			for (let i = 0; i < optionsArr.length; i++) {
				entries.push({ key: i.toString(), value: optionsArr[i] });
			}
			return entries;
		} else if (optionsObj) {
			const values = Object.values(optionsObj);
			const keys = Object.keys(optionsObj);

			for (let i = 0; i < values.length; i++) {
				entries.push({ key: keys[i], value: values[i] });
			}
			return entries;
		} else {
			return [];
		}
	});

	$effect(() => {
		if (value === '') {
			value = options[0].key;
		}
	});
</script>

{#snippet select()}
	<select class="select" class:noMargin onchange={handleOnChange} bind:value onfocusin={() => onFocusChange(true)} onfocusout={() => onFocusChange(false)}>
		{#each options as option}
			<option value={option.key}>{option.value}</option>
		{/each}
	</select>
{/snippet}

{#if title !== ''}
	<LabelWrapper {title}>
		{@render select()}
	</LabelWrapper>
{:else}
	{@render select()}
{/if}

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	select.select {
		@include g.input;
	}
	select.select.noMargin {
		margin: 0;
	}
</style>
