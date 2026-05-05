<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import Modal from '../Modal.svelte';
	import { lang, persistSettings, settings } from '$lib/store/settings.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import {
		LanguageOptions,
		ThemeOptions,
		type LanguagesType,
		type ThemesType
	} from '$lib/store/settings_structure/settings_enums';
	import { appLogDir } from '@tauri-apps/api/path';
	import { invoke } from '@tauri-apps/api/core';
	import { open } from '@tauri-apps/plugin-dialog';
	import Callout from '$lib/components/atoms/Callout.svelte';
	import { lstat, readDir } from '@tauri-apps/plugin-fs';

	interface Props {
		dialog: HTMLDialogElement;
	}

	let { dialog = $bindable() }: Props = $props();

	const onLanguageChange = (key: string) => {
		// note: only works because both enum keys and values are all caps!
		settings().language = key as LanguagesType;
		persistSettings();
	};
	const onThemeChange = (key: string) => {
		// note: only works because both enum keys and values are all caps!
		settings().theme = key as ThemesType;
		persistSettings();
	};

	async function changeDataDir() {
		try {
			const path = await open({
				title: lang().settings.change_data_dir,
				multiple: false,
				directory: true,
				recursive: false
			});

			if (path === null || path === '') {
				return;
			}

			const stat = await lstat(path);
			if (stat.isSymlink) {
				alert(lang().settings.data_dir_symlink_error);
				return;
			}
			const entries = await readDir(path);
			if (entries.length > 0) {
				alert(lang().settings.data_dir_not_empty_error);
				return;
			}

			await invoke('request_new_data_dir_on_restart', { newDir: path });
			currentDataDir = new Promise((resolve) => resolve(path));
		} catch (error) {
			console.error('Error changing data directory:', error);
			alert(
				`${lang().settings.change_data_dir_error}\n\n${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
	let logsDir = $state<Promise<string> | null>(null);
	let currentDataDir = $state<Promise<string> | null>(invoke('get_current_data_dir'));
</script>

<Modal bind:dialog title={lang().settings.title}>
	<p class="label">{lang().settings.current_data_dir}</p>
	<p>
		{#await currentDataDir}
			{lang().settings.current_data_dir_loading}
		{:then dir}
			{dir}
		{:catch}
			{lang().settings.current_data_dir_error}
		{/await}
	</p>

	<button class="change-data-dir-btn" onclick={changeDataDir}>
		{lang().settings.change_data_dir}
	</button>

	<Callout type="warning">
		{lang().settings.data_dir_change_info}
	</Callout>

	<LabeledDropdown
		title={lang().settings.language}
		optionsObj={LanguageOptions}
		onChange={onLanguageChange}
	></LabeledDropdown>

	<LabeledDropdown
		title={lang().settings.theme}
		optionsObj={ThemeOptions}
		onChange={onThemeChange}
		value={settings().theme}
	></LabeledDropdown>
	<button class="logs-btn" onclick={() => (logsDir = appLogDir())}>
		{lang().settings.show_logs_dir}
	</button>
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
		<button
			class="close"
			onclick={() => {
				dialog?.close();
			}}>{lang().settings.close}</button
		>
	{/snippet}
</Modal>

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
	.close {
		@include g.button-primary;
	}
	button.logs-btn,
	button.change-data-dir-btn {
		@include g.button-secondary;
	}
	button.change-data-dir-btn {
		margin-top: g.$spacing-m;
	}
	p {
		@include g.text;
		margin-top: g.$spacing-m;

		&.label {
			@include g.text-small;
		}
	}
</style>
