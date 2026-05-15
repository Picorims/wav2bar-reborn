<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import Modal from '../Modal.svelte';
	import { lang, settings } from '$lib/store/settings.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import { Folder } from 'lucide-svelte';
	import { save } from '@tauri-apps/plugin-dialog';
	import { Channel, invoke } from '@tauri-apps/api/core';
	import { platform } from '@tauri-apps/plugin-os';
	import { join } from '@tauri-apps/api/path';
	import { Log } from '$lib/log/logger';
	import { renderer } from '$lib/engine/video/renderer';
	import { setLoading, setLoadingInfo, setLoadingInfoDetail, setLoadingProgress } from '$lib/store/app_state.svelte';
	import { saveManager } from '$lib/store/save.svelte';

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

	async function exportVideo() {
		if (exportPath === "") {
			alert(lang().export_video.no_video_path_error);
			return;
		}

		const ffmpeg_available = await invoke<boolean>('is_ffmpeg_available');
		if (!ffmpeg_available && settings().ffmpeg_path === "") {
			alert(lang().export_video.ffmpeg_not_configured_error);
		}

		Log.export.info("Setting up export.");
		dialog.close();
		setLoading(true);
		setLoadingInfo("Setting up export...");
		let ffmpegPath = settings().ffmpeg_path;
		ffmpegPath = await join(ffmpegPath, "ffmpeg");
		if (platform() === "windows") {
			ffmpegPath += ".exe";
		}

		const onWsReady = new Channel<number>();
		onWsReady.onmessage = (port) => {
			const socket = new WebSocket("ws://localhost:" + port);
			socket.binaryType = "arraybuffer";

			socket.addEventListener("open", async () => {
				Log.export.info("WebSocket opened on front-end.");

				renderer.pauseTick();
				renderer.seekToStart();
				renderer.shallLoop(false);
				setLoadingInfo("Exporting frames...");
				setLoadingInfoDetail("0%");
				setLoadingProgress(0);
				let lastLog = 0;
				const fps = saveManager.fps;
				const durationSeconds = renderer.getDuration() / 1000;
				const totalFrames = Math.ceil(fps * durationSeconds);

				for (let i = 0; i < totalFrames; i++) {
					const percent = i / totalFrames * 100;
					renderer.seekToPercent(percent);
					renderer.updateOnce();
					setLoadingProgress(percent);
					const snapshot = await renderer.getSnapshot();
					// typed arrays are supported, in case it shows as an error:
					// https://developer.mozilla.org/fr/docs/Web/API/WebSocket/send
					socket.send(snapshot.pixels);
					if (performance.now() - lastLog > 1000) {
						Log.export.info(`Export frames progress: ${percent}`);
						lastLog = performance.now();
					}
				}
				socket.send("done");
			});

			socket.addEventListener("error", () => {
				Log.export.error("An unknown WebSocket error has occured.");
			});

			socket.addEventListener("close", (e) => {
				Log.export.info(`WebSocket connection closed: ${e.code} - ${e.reason}`);
			});
		}
		invoke("setup_export", {
			videoPath: exportPath,
			ffmpegPath,
			screenWidth: saveManager.save.screen.width,
			screenHeight: saveManager.save.screen.height,
			fps: saveManager.save.fps,
			onWsReady });
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
