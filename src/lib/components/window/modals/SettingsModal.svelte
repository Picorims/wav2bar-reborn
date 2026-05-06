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
	import { invoke } from '@tauri-apps/api/core';
	import { open } from '@tauri-apps/plugin-dialog';
	import Callout from '$lib/components/atoms/Callout.svelte';
	import { lstat, readDir } from '@tauri-apps/plugin-fs';
	import { join } from '@tauri-apps/api/path';
	import { Check, Folder, Trash2, X } from 'lucide-svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import { platform } from '@tauri-apps/plugin-os';

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

	async function changeFFmpegPath() {
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
				alert(lang().settings.ffmpeg.dir_symlink_error);
				return;
			}

			const entries = await readDir(path);
			let hasFFmpeg = false;
			let hasFFprobe = false;
			const os = platform();
			for (const entry of entries) {
				if (entry.isFile) {
					if (
						(os === 'windows' && entry.name === 'ffmpeg.exe') ||
						(os === 'linux' && entry.name === 'ffmpeg')
					) {
						hasFFmpeg = true;
					}
					if (
						(os === 'windows' && entry.name === 'ffprobe.exe') ||
						(os === 'linux' && entry.name === 'ffprobe')
					) {
						hasFFprobe = true;
					}
				}
			}

			if (!hasFFmpeg || !hasFFprobe) {
				alert(lang().settings.ffmpeg.missing_exe_error);
				return;
			}

			settings().ffmpeg_path = path;
			persistSettings();
		} catch (error) {
			console.error('Error changing data directory:', error);
			alert(
				`${lang().settings.change_data_dir_error}\n\n${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	function clearFFmpegPath() {
		settings().ffmpeg_path = '';
		persistSettings();
	}

	let currentDataDir = $state<Promise<string> | null>(invoke('get_current_data_dir'));
	let logsDir = $derived<Promise<string> | null>(
		currentDataDir?.then((v) => join(v, 'logs')) ?? null
	);
	let showLogsPath = $state(false);
</script>

{#snippet status(detected: boolean)}
	{#if detected}
		<span class="text-and-icon yes">
			{lang().settings.ffmpeg.detected}
			<Check></Check>
		</span>
	{:else}
		<span class="text-and-icon no">
			{lang().settings.ffmpeg.not_detected}
			<X></X>
		</span>
	{/if}
{/snippet}

{#snippet trash2()}
	<Trash2 />
{/snippet}
{#snippet folder()}
	<Folder />
{/snippet}

<Modal bind:dialog title={lang().settings.title}>
	<h3>{lang().settings.subtitle_generic}</h3>

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

	<div class="flex">
		<button class="logs-btn" onclick={() => (showLogsPath = true)}>
			{lang().settings.show_logs_dir}
		</button>
		<p class="path">
			{#await logsDir}
				Loading...
			{:then dir}
				{#if dir !== null && dir !== ''}
					{#if showLogsPath}
						{dir}
					{/if}
				{:else}
					System logs dir could not be retrieved.
				{/if}
			{:catch}
				System logs dir could not be retrieved.
			{/await}
		</p>
	</div>

	<hr />
	<h3>{lang().settings.subtitle_ffmpeg}</h3>

	<p class="label">
		{lang().settings.ffmpeg.ffmpeg_autodetected}
		{#await invoke<boolean>('is_ffmpeg_available')}
			{lang().settings.ffmpeg.loading}
		{:then detected}
			{@render status(detected)}
		{/await}
	</p>

	<p class="label">
		{lang().settings.ffmpeg.ffprobe_autodetected}
		{#await invoke<boolean>('is_ffprobe_available')}
			{lang().settings.ffmpeg.loading}
		{:then detected}
			{@render status(detected)}
		{/await}
	</p>

	<p class="label">{lang().settings.ffmpeg.override}</p>
	<div class="flex">
		<Button
			margin
			iconRight={folder}
			label={lang().settings.ffmpeg.change_path}
			onClick={changeFFmpegPath}
		/>
		<p class="path">{settings().ffmpeg_path}</p>
	</div>
	<Button
		margin
		iconRight={trash2}
		label={lang().settings.ffmpeg.clear_override}
		onClick={clearFFmpegPath}
	/>

	<hr />
	<h3>{lang().settings.subtitle_data_storage}</h3>

	<div class="flex">
		<p class="label">{lang().settings.current_data_dir}</p>
		<p class="path">
			{#await currentDataDir}
				{lang().settings.current_data_dir_loading}
			{:then dir}
				{dir}
			{:catch}
				{lang().settings.current_data_dir_error}
			{/await}
		</p>
	</div>

	<button class="change-data-dir-btn" onclick={changeDataDir}>
		{lang().settings.change_data_dir}
	</button>

	<Callout type="warning">
		{lang().settings.data_dir_change_info}
	</Callout>

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
		&.path {
			margin-left: g.$spacing-l;
		}
	}
	hr {
		border-color: g.$color-background-800;
		border-width: g.$size-5xs;
	}
	h3 {
		@include g.heading-3;
	}
	div.flex {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: g.$spacing-l;
	}
	span.text-and-icon {
		display: inline-flex;
		align-items: center;
		gap: g.$spacing-m;
	}
	span.yes :global(svg) {
		stroke: g.$color-status-success;
	}
	span.no :global(svg) {
		stroke: g.$color-status-error;
	}
</style>
