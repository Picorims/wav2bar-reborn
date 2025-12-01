<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import Modal from '../Modal.svelte';
	import { lang } from '$lib/store/settings';
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { saveManager } from "$lib/store/save.svelte";
	import { onMount } from 'svelte';
	import { SPECTRUM_SIZE_DEFAULT } from '$lib/engine/audio/file_audio_cached_fft_provider';
	import LabelInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	interface Props {
		dialog: HTMLDialogElement | null;
	}

	let { dialog = $bindable() }: Props = $props();
	let progressText = $state<string>('');
	let stopListening = $state<() => void>(() => {
		console.warn("stopListening called before being set!");
	});

	const DEFAULT_FPS = 60;
	const DEFAULT_WIDTH = 1280;
	const DEFAULT_HEIGHT = 720;
	let fps = $state<number>(DEFAULT_FPS);
	let width = $state<number>(DEFAULT_WIDTH);
	let height = $state<number>(DEFAULT_HEIGHT);

	$effect(() => {
		saveManager.fps = fps;
	});
	$effect(() => {
		saveManager.resolution = {
			width: width,
			height: height
		};
	});


	function bakeFFT() {
		invoke('bake_fft', {
			audioFileName: saveManager.save.audio_filename,
			fps: saveManager.save.fps,
			fftSize: 2 * SPECTRUM_SIZE_DEFAULT // TODO new save setting
		});
	}

	async function listenForProgress() {
		const unsubscribe = await listen<number>("audio_fft_progress", (event) => {
			const progress = event.payload;
			progressText = `FFT Baking Progress: ${progress.toFixed(2)}%`;
		});
		stopListening = unsubscribe;
	}

	onMount(() => {
		listenForProgress();
		return stopListening;
	});
</script>

<Modal bind:dialog title={$lang.modal.project_settings.title}>
	<LabelInputNumber
		defaultValue={DEFAULT_FPS}
		title={$lang.modal.project_settings.fps}
		value={fps}
		onChange={(val: number) => (fps = val)}
		min={1}
		step={1}
	/>
	<LabelInputNumber
		defaultValue={DEFAULT_WIDTH}
		title={$lang.modal.project_settings.width}
		value={width}
		onChange={(val: number) => (width = val)}
		min={1}
		step={1}
		unit={'px'}
	/>
	<LabelInputNumber
		defaultValue={DEFAULT_HEIGHT}
		title={$lang.modal.project_settings.height}
		value={height}
		onChange={(val: number) => (height = val)}
		min={1}
		step={1}
		unit={'px'}
	/>
	<button class="fft-btn" onclick={bakeFFT}>{$lang.modal.project_settings.bake_fft}</button>
	<p>{progressText}</p>

	{#snippet buttons()}
		<button
			class="close"
			onclick={() => {
				dialog?.close();
			}}>{$lang.modal.project_settings.close}</button
		>
	{/snippet}
</Modal>

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
	.close {
		@include g.button-primary;
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
