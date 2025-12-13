<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import { run } from 'svelte/legacy';

	import LabelWrapper from './LabelWrapper.svelte';

	interface Props {
		optionsArr?: string[] | null;
		optionsObj?: Record<string, string> | null;
		title?: string;
		onChange?: (key: string) => void;
		value?: string;
	}

	let {
		optionsArr = null,
		optionsObj = null,
		title = '',
		onChange = () => {},
		value = $bindable('')
	}: Props = $props();

	const handleOnChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		onChange(select.value);
	};

	let options: { key: string; value: string }[] = $state([]);
	// TODO migrate to svelte 5
	run(() => {
		options = [];
		if (optionsArr) {
			for (let i = 0; i < optionsArr.length; i++) {
				options.push({ key: i.toString(), value: optionsArr[i] });
			}
		} else if (optionsObj) {
			const values = Object.values(optionsObj);
			const keys = Object.keys(optionsObj);

			for (let i = 0; i < values.length; i++) {
				options.push({ key: keys[i], value: values[i] });
			}
		} else {
			options = [];
		}

		if (value === '') {
			value = options[0].key;
		}
	});
</script>

<LabelWrapper {title}>
	<select class="select" onchange={handleOnChange} bind:value>
		{#each options as option}
			<option value={option.key}>{option.value}</option>
		{/each}
	</select>
</LabelWrapper>

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	select.select {
		@include g.input;
	}
</style>
