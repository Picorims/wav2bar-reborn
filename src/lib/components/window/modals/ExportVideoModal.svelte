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
	import {
		setLoading,
		setLoadingInfo,
		setLoadingInfoDetail,
		setLoadingProgress
	} from '$lib/store/app_state.svelte';
	import { saveManager } from '$lib/store/save.svelte';

	interface Props {
		dialog: HTMLDialogElement;
	}

	let { dialog = $bindable() }: Props = $props();
	let exportPath = $state('');

	async function changeExportPath() {
		const path = await save({
			title: lang().export_video.set_video_path,
			filters: [
				{
					extensions: ['webm'],
					name: lang().export_video.video_picker.filters.all_supported_video_files
				},
				{
					extensions: ['webm'],
					name: lang().export_video.video_picker.filters.webm_video_file
				}
			]
		});

		if (path === null || path === '') {
			return;
		}

		exportPath = path;
	}

	async function exportVideo() {
		if (exportPath === '') {
			alert(lang().export_video.no_video_path_error);
			return;
		}

		const ffmpeg_available = await invoke<boolean>('is_ffmpeg_available');
		if (!ffmpeg_available && settings().ffmpeg_path === '') {
			alert(lang().export_video.ffmpeg_not_configured_error);
			return;
		}
		if (saveManager.save.audio_filename === '') {
			alert(lang().export_video.missing_audio_error);
			return;
		}

		Log.export.info('Setting up export.');
		dialog.close();
		setLoading(true);
		setLoadingInfo('Setting up export...');
		let ffmpegPath = settings().ffmpeg_path;
		ffmpegPath = await join(ffmpegPath, 'ffmpeg');
		if (platform() === 'windows') {
			ffmpegPath += '.exe';
		}

		renderer.shallLoop(false);
		renderer.stop();
		renderer.resetTickEngine();
		renderer.seekToStart();
		setLoadingInfo('Exporting frames...');
		setLoadingProgress(0);
		let lastLog = 0;
		const fps = saveManager.fps;
		const durationSeconds = renderer.getDuration() / 1000;
		const totalFrames = Math.ceil(fps * durationSeconds);
		const dataDir = await invoke<string>('get_current_data_dir');
		const audioPath = await join(
			dataDir,
			'temp',
			'current_save',
			'assets',
			'audio',
			saveManager.save.audio_filename
		);
		let frame = 0;
		let failedFrames = 0;

		const setInfoDetail = (
			frame: number,
			totalFrames: number,
			failedFrames: number,
			suffix?: string
		) => {
			setLoadingInfoDetail(
				`position: ${frame} / ${totalFrames}, failed frames: ${failedFrames}${suffix ? ` - ${suffix}` : ''}`
			);
		};
		setInfoDetail(frame, totalFrames, failedFrames);

		const onWsReady = new Channel<number>();
		onWsReady.onmessage = (port) => {
			const socket = new WebSocket('ws://localhost:' + port);
			socket.binaryType = 'arraybuffer';

			socket.addEventListener('open', async () => {
				Log.export.info('WebSocket opened on front-end.');
			});

			socket.addEventListener('message', async (msg) => {
				if (msg.data === 'next_from_success' || msg.data === 'next_from_failures') {
					if (msg.data === 'next_from_failure') {
						failedFrames += 1;
					}
					if (frame >= totalFrames) {
						socket.send('done');
					} else {
						const percent = (frame / totalFrames) * 100;
						renderer.seekToPercent(percent);
						renderer.updateOnce();
						setLoadingProgress(percent);
						const snapshot = await renderer.getSnapshot();
						const px = snapshot.pixels;
						if (frame === 0) {
							Log.export.debug(`frame size: ${px.BYTES_PER_ELEMENT * px.length}`);
							Log.export.debug(`frame resolution: ${snapshot.width}x${snapshot.height}`);
							Log.export.debug(
								`expected frame size: ${4 * saveManager.save.screen.width * saveManager.save.screen.height}`
							);
							Log.export.debug(
								`expected frame resolution: ${saveManager.save.screen.width}x${saveManager.save.screen.height}`
							);
						}
						// typed arrays are supported, in case it shows as an error:
						// https://developer.mozilla.org/fr/docs/Web/API/WebSocket/send
						socket.send(px);
						if (performance.now() - lastLog > 2000) {
							Log.export.info(`Export frames progress: ${frame}`);
							lastLog = performance.now();
						}

						frame++;
						setInfoDetail(frame, totalFrames, failedFrames);
					}
				} else if (msg.data === 'creating_slice') {
					setInfoDetail(frame, totalFrames, failedFrames, 'Concatenating frames into slice...');
				} else if (msg.data === 'concatenating') {
					setInfoDetail(
						frame,
						totalFrames,
						failedFrames,
						'Combining slices and audio into final video...'
					);
				} else if (msg.data === 'done') {
					socket.close();
					setLoading(false);
					alert('Video successfully exported!');
				} else if (msg.data === 'failed_concat') {
					socket.close();
					setLoading(false);
					alert('Video export failure: failed at slices concatenation.');
				}
			});

			socket.addEventListener('error', () => {
				Log.export.error('An unknown WebSocket error has occured.');
			});

			socket.addEventListener('close', (e) => {
				Log.export.info(`WebSocket connection closed: ${e.code} - ${e.reason}`);
			});
		};

		invoke('setup_export', {
			videoPath: exportPath,
			audioPath,
			ffmpegPath,
			screenWidth: saveManager.save.screen.width,
			screenHeight: saveManager.save.screen.height,
			fps: saveManager.save.fps,
			totalFrames,
			onWsReady
		});
	}
</script>

{#snippet folder()}
	<Folder />
{/snippet}

<Modal bind:dialog title={lang().export_video.title} withButtonGap>
	<p>WEBM format, VP9 codec.</p>
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
		<Button label={lang().export_video.export} onClick={exportVideo} variant="accent"></Button>
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
