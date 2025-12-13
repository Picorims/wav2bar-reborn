<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import Modal from '../Modal.svelte';
	import { lang, settings } from '$lib/store/settings';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import {
		LanguageOptions,
		ThemeOptions,
		type LanguagesType,
		type ThemesType
	} from '$lib/store/settings_structure/settings_enums';
	import { appLogDir } from "@tauri-apps/api/path";

	interface Props {
		dialog: HTMLDialogElement;
	}

	let { dialog = $bindable() }: Props = $props();

	const onLanguageChange = (key: string) => {
		// note: only works because both enum keys and values are all caps!
		$settings.language = key as LanguagesType;
		$settings = $settings;
	};
	const onThemeChange = (key: string) => {
		// note: only works because both enum keys and values are all caps!
		$settings.theme = key as ThemesType;
		$settings = $settings;
	};

	let logsDir = $state<Promise<string> | null>(null);
</script>

<Modal bind:dialog title={$lang.settings.title}>
	<LabeledDropdown
		title={$lang.settings.language}
		optionsObj={LanguageOptions}
		onChange={onLanguageChange}
	></LabeledDropdown>
	
    <LabeledDropdown
        title={$lang.settings.theme}
        optionsObj={ThemeOptions}
        onChange={onThemeChange}
	></LabeledDropdown>
	<button class="logs-btn" onclick={() => logsDir = appLogDir()}>{$lang.settings.show_logs_dir}</button>
	<p>
		{#await logsDir}
			Loading...
		{:then dir} 
			{dir}
		{:catch}
			System logs dir could not be retrieved.
		{/await}
	</p>

    {#snippet buttons()}
		<button  class="close" onclick={() => {dialog?.close()}}>{$lang.settings.close}</button>
	{/snippet}
</Modal>

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
	.close {
		@include g.button-primary;
	}
	.logs-btn {
		@include g.button-secondary;
	}
	p {
		@include g.text;
		margin-top: g.$spacing-m;
	}
</style>
