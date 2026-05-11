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
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import { Folder } from 'lucide-svelte';
	import { save } from '@tauri-apps/plugin-dialog';

	interface Props {
		dialog: HTMLDialogElement;
	}

	let { dialog = $bindable() }: Props = $props();
	let exportPath = $state("");

	async function changeExportPath() {
		const path = await save({
			title: lang().export_video.set_video_path,
			filters: [
				{
					extensions: ['av1'],
					name: lang().export_video.video_picker.filters.all_supported_video_files
				},
				{
					extensions: ['av1'],
					name: lang().export_video.video_picker.filters.av1_video_file
				},
			]
		});

		if (path === null || path === '') {
			return;
		}

		exportPath = path;
	}

	function exportVideo() {
		if (exportPath === "") {
			alert(lang().export_video.no_video_path_error)
		}
	}
</script>

{#snippet folder()}
	<Folder />
{/snippet}

<Modal bind:dialog title={lang().export_video.title} withButtonGap>

	<div class="flex">
		<Button
			margin
			iconRight={folder}
			label={lang().export_video.set_video_path}
			onClick={changeExportPath}
		/>
		<p class="path">{exportPath}</p>
	</div>

	{#snippet buttons()}
		<Button
			label={lang().export_video.cancel}
			onClick={() => {
				dialog?.close();
			}}
		></Button>
		<Button
			label={lang().export_video.export}
			onClick={exportVideo}
			variant={"accent"}
		></Button>
	{/snippet}
</Modal>

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
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
	div.flex {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: g.$spacing-l;
	}
</style>
