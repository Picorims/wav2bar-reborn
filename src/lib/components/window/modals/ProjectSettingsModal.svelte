<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import Modal from '../Modal.svelte';
	import { lang } from '$lib/store/settings.svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { open } from '@tauri-apps/plugin-dialog';
	import { listen } from '@tauri-apps/api/event';
	import { saveManager } from '$lib/store/save.svelte';
	import { onMount } from 'svelte';
	import { SPECTRUM_SIZE_DEFAULT } from '$lib/engine/audio/file_audio_cached_fft_provider';
	import LabelInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { Log } from '$lib/log/logger';
	import { filenameWithExtensionFromPath } from '$lib/string';

	interface Props {
		dialog: HTMLDialogElement;
	}

	let { dialog = $bindable() }: Props = $props();
	let progressText = $state<string>('');
	let stopListening = $state<() => void>(() => {
		console.warn('stopListening called before being set!');
	});

	let fps = $state<number>(saveManager.fps);
	let width = $state<number>(saveManager.resolution.width);
	let height = $state<number>(saveManager.resolution.height);
	let audioFile = $state<string>(getAudioFileDisplay(saveManager.save.audio_filename));

	function getAudioFileDisplay(name: string) {
		return name.length === 0 ? lang().modal.project_settings.no_audio_selected : name;
	}

	function onOpen() {
		fps = saveManager.fps;
		width = saveManager.resolution.width;
		height = saveManager.resolution.height;
		audioFile = getAudioFileDisplay(saveManager.save.audio_filename);
	}

	function updateFPS() {
		saveManager.fps = fps;
	}
	function updateResolution() {
		saveManager.resolution = { width, height };
	}

	async function pickAudio() {
		const path = await open({
			title: lang().modal.project_settings.audio_picker.title,
			multiple: false,
			directory: false,
			recursive: false,
			filters: [
				{
					extensions: ['mp3', 'wav', 'ogg'],
					name: lang().modal.project_settings.audio_picker.filters.all_supported_audio_files
				},
				{
					extensions: ['mp3'],
					name: lang().modal.project_settings.audio_picker.filters.mp3_audio_file
				},
				{
					extensions: ['wav'],
					name: lang().modal.project_settings.audio_picker.filters.wav_audio_file
				},
				{
					extensions: ['ogg'],
					name: lang().modal.project_settings.audio_picker.filters.ogg_vorbis_audio_file
				}
			]
		});

		if (path === null) {
			Log.ui.info('No audio file selected');
			return;
		} else {
			const filename = filenameWithExtensionFromPath(path);
			Log.ui.info(`Audio file selected: ${filename}`);
			const previousFilename = saveManager.save.audio_filename;
			saveManager.save.audio_filename = filename;
			audioFile = getAudioFileDisplay(filename);

			try {
				await invoke('copy_audio_file_to_save', { audioFilePath: path });
				Log.ui.info('Audio file copied to save folder.');
				await saveManager.loadAudioFile();
			} catch (e) {
				Log.ui.error(
					'Failed to copy audio file to save folder:',
					e instanceof Error ? e.message : String(e)
				);
				// revert to previous filename on error
				Log.ui.info('Reverting to previous audio file.');
				saveManager.save.audio_filename = previousFilename;
				audioFile = getAudioFileDisplay(previousFilename);
				try {
					await invoke('restore_last_audio_file_from_backup');
					Log.ui.info('Previous audio file restored from backup.');
				} catch (e) {
					Log.ui.error(
						'Failed to restore previous audio file from backup:',
						e instanceof Error ? e.message : String(e)
					);
					saveManager.save.audio_filename = '';
					audioFile = getAudioFileDisplay('');
					alert(lang().modal.project_settings.audio_restore_failed);
				}
			}
		}
	}

	function bakeFFT() {
		invoke('bake_fft', {
			audioFileName: saveManager.save.audio_filename,
			fps: saveManager.save.fps,
			fftSize: 2 * SPECTRUM_SIZE_DEFAULT // TODO new save setting
		});
	}

	async function listenForProgress() {
		const unsubscribe = await listen<number>('audio_fft_progress', (event) => {
			const progress = event.payload;
			progressText = `FFT Baking Progress: ${progress.toFixed(2)}%`;
		});
		stopListening = unsubscribe;
	}

	onMount(() => {
		listenForProgress();
		return () => {
			stopListening();
		};
	});
</script>

<Modal bind:dialog title={lang().modal.project_settings.title} {onOpen}>
	<LabelInputNumber
		defaultValue={saveManager.fps}
		title={lang().modal.project_settings.fps}
		value={fps}
		onChange={(val: number) => {
			fps = val;
			updateFPS();
		}}
		min={1}
		step={1}
	/>
	<LabelInputNumber
		defaultValue={saveManager.resolution.width}
		title={lang().modal.project_settings.width}
		value={width}
		onChange={(val: number) => {
			width = val;
			updateResolution();
		}}
		min={1}
		step={1}
		unit={'px'}
	/>
	<LabelInputNumber
		defaultValue={saveManager.resolution.height}
		title={lang().modal.project_settings.height}
		value={height}
		onChange={(val: number) => {
			height = val;
			updateResolution();
		}}
		min={1}
		step={1}
		unit={'px'}
	/>
	<button class="audio-btn" onclick={pickAudio}>{lang().modal.project_settings.pick_audio}</button>
	<p>{audioFile}</p>
	<button class="fft-btn" onclick={bakeFFT}>{lang().modal.project_settings.bake_fft}</button>
	<p>{progressText}</p>

	{#snippet buttons()}
		<button
			class="close"
			onclick={() => {
				dialog?.close();
			}}>{lang().modal.project_settings.close}</button
		>
	{/snippet}
</Modal>

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
	.close {
		@include g.button-primary;
	}
	.audio-btn {
		@include g.button-accent;
		margin-top: g.$spacing-l;
		margin-bottom: g.$spacing-m;
	}
	.fft-btn {
		@include g.button-secondary;
		margin-top: g.$spacing-l;
		margin-bottom: g.$spacing-m;
	}
	span {
		@include g.text;
		margin-bottom: g.$spacing-m;
	}
</style>
