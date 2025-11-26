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

	interface Props {
		dialog: HTMLDialogElement | null;
	}

	let { dialog = $bindable() }: Props = $props();
	let progressText = $state<string>('');
	let stopListening = $state<() => void>(() => {
		console.warn("stopListening called before being set!");
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

<Modal bind:dialog title={$lang.project_settings.title}>
	<button class="fft-btn" onclick={bakeFFT}>{$lang.project_settings.bake_fft}</button>
	<p>{progressText}</p>

	{#snippet buttons()}
		<button
			class="close"
			onclick={() => {
				dialog?.close();
			}}>{$lang.project_settings.close}</button
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
