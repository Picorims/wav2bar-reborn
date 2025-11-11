<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/
	import IconButton from "../atoms/IconButton.svelte";
	import { FileCog, FilePlus, FolderOpen, Save, Settings, HelpCircle } from "lucide-svelte";
	import { saveManager } from "$lib/store/save.svelte";
	import { renderer } from "$lib/engine/video/renderer";
	import SettingsModal from "../window/modals/SettingsModal.svelte";
	import Modal from "../window/Modal.svelte";
	import { invoke } from "@tauri-apps/api/core";

	interface Props {
		title?: string;
		saved?: boolean;
	}

	let { title = "", saved = false }: Props = $props();
	let settingsModalDialog = $state<HTMLDialogElement | null>(null);
	let projectSettingsModalDialog = $state<HTMLDialogElement | null>(null);

	function openAndLoadSave() {
		saveManager.openSave(renderer);
	}
	function writeSave() {
		saveManager.saveToFile();
	}

	function bakeFFT() {
		invoke("bake_fft", {audioFileName: saveManager.save.audio_filename, fps: saveManager.save.fps, fftSize: 8192});
	}
</script>

<div class="card">
	<span class="project-title">{title}{saved? "" : "*"}</span>
	<IconButton onClick={() => {projectSettingsModalDialog?.showModal()}}>
		<FileCog/>
	</IconButton>

	<IconButton>
		<FilePlus/>
	</IconButton>

	<IconButton onClick={openAndLoadSave}>
		<FolderOpen/>
	</IconButton>

	<IconButton onClick={writeSave}>
		<Save/>
	</IconButton>

	<IconButton onClick={() => {settingsModalDialog?.showModal()}}>
		<Settings/>
	</IconButton>

	<IconButton>
		<HelpCircle/>
	</IconButton>

	<SettingsModal bind:dialog={settingsModalDialog} />
	<Modal bind:dialog={projectSettingsModalDialog} title="Project Settings">
		<p>Project settings go here</p>
		<button onclick={bakeFFT}>bake fft</button>
		{#snippet buttons()}
			<button onclick={() => {projectSettingsModalDialog?.close()}}>Close</button>
		{/snippet}
	</Modal>

</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	.card {
		display: flex;
		gap: g.$spacing-s;
		align-items: center;
		width: 100%;
		height: 100%;
		@include g.card;
		padding: g.$spacing-m;
	}

	span.project-title {
		@include g.text-strong;
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		text-wrap: nowrap;
	}
</style>
