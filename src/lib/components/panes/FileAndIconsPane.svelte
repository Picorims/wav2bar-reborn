<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/
	import IconButton from '../atoms/IconButton.svelte';
	import { FileCog, FilePlus, FolderOpen, Save, Settings, HelpCircle, Rocket } from 'lucide-svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import { renderer } from '$lib/engine/video/renderer';
	import SettingsModal from '../window/modals/SettingsModal.svelte';
	import ProjectSettingsModal from '../window/modals/ProjectSettingsModal.svelte';
	import { lang } from '$lib/store/settings.svelte';
	import ExportVideoModal from '../window/modals/ExportVideoModal.svelte';
	import TextIconModal from '../window/modals/TextIconModal.svelte';

	interface Props {
		title?: string;
		saved?: boolean;
	}

	let { title = '', saved = false }: Props = $props();
	let settingsModalDialog = $state<HTMLDialogElement>(document.createElement('dialog'));
	let projectSettingsModalDialog = $state<HTMLDialogElement>(document.createElement('dialog'));
	let exportVideoModalDialog = $state<HTMLDialogElement>(document.createElement('dialog'));
	let saveOpenErrorDialog = $state<HTMLDialogElement>(document.createElement('dialog'));
	let saveErrorDescription = $state('');
	let saveErrorMode = $state<'warning' | 'error'>('error');

	async function openAndLoadSave() {
		const result = await saveManager.openSave(renderer);
		saveErrorDescription = result.message;
		if (!result.success) {
			saveErrorMode = 'error';
			saveOpenErrorDialog.showModal();
		} else if (result.warn) {
			saveErrorMode = 'warning';
			saveOpenErrorDialog.showModal();
		}
	}
	function writeSave() {
		saveManager.saveToFile();
	}
</script>

<TextIconModal
	bind:dialog={saveOpenErrorDialog}
	mode="alert"
	kind={saveErrorMode}
	title={saveErrorMode === 'error'
		? lang().modal.save_open_error.error_title
		: lang().modal.save_open_error.warning_title}
	description={saveErrorDescription.replaceAll('\n', '\n\n')}
/>

<div class="card">
	<span class="project-title">{title}{saved ? '' : '*'}</span>
	<IconButton
		onClick={() => {
			projectSettingsModalDialog?.showModal();
		}}
		alt={lang().files_and_icons_pane.project_settings}
	>
		<FileCog />
	</IconButton>

	<IconButton alt={lang().files_and_icons_pane.new_project} disabled>
		<FilePlus />
	</IconButton>

	<IconButton onClick={openAndLoadSave} alt={lang().files_and_icons_pane.open_project}>
		<FolderOpen />
	</IconButton>

	<IconButton onClick={writeSave} alt={lang().files_and_icons_pane.save_project}>
		<Save />
	</IconButton>

	<IconButton
		onClick={() => {
			exportVideoModalDialog?.showModal();
		}}
		alt={lang().files_and_icons_pane.export}
	>
		<Rocket />
	</IconButton>

	<IconButton
		onClick={() => {
			settingsModalDialog?.showModal();
		}}
		alt={lang().files_and_icons_pane.settings}
	>
		<Settings />
	</IconButton>

	<IconButton alt={lang().files_and_icons_pane.help} disabled tooltipDir="bottom-left">
		<HelpCircle />
	</IconButton>

	<SettingsModal bind:dialog={settingsModalDialog} />
	<ProjectSettingsModal bind:dialog={projectSettingsModalDialog} />
	<ExportVideoModal bind:dialog={exportVideoModalDialog} />
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
