<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import IconButton from '$lib/components/atoms/IconButton.svelte';
	import SeparatorVertical from '$lib/components/atoms/SeparatorVertical.svelte';
	import { renderer } from '$lib/engine/video/renderer';
	import { lang } from '$lib/store/settings.svelte';
	import { msToMMSS } from '$lib/string';
	import {
		SkipBack,
		CirclePlay,
		CirclePause,
		SkipForward,
		IterationCw,
		IterationCcw,
		Repeat
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let paused = $state(true);
	let sliderValue = $state(0);
	let progressMs = $state(0);
	let durationMs = $state(0);

	function togglePause() {
		paused = !paused;
		if (paused) {
			// Pause audio
			renderer.pauseTick();
		} else {
			// Play audio
			renderer.play();
		}
	}

	function seekToStart() {
		renderer.seekToStart();
	}
	function seekToEnd() {
		renderer.seekToEnd();
	}

	function updateSlider() {
		if (!renderer) return;
		progressMs = renderer.getProgress();
		durationMs = renderer.getDuration();
		sliderValue = (progressMs / durationMs) * 100;
	}

	function onInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = Number(target.value);
		renderer.seekToPercent(value);
	}

	onMount(() => {
		const interval = setInterval(() => {
			updateSlider();
			paused = renderer.isPaused();
		}, 100);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="container">
	<div class="group">
		<IconButton onClick={seekToStart} alt={lang().controls_pane.playback.seek_to_start}>
			<SkipBack />
		</IconButton>
		<IconButton onClick={togglePause} alt={paused ? lang().controls_pane.playback.play : lang().controls_pane.playback.pause}>
			{#if paused}
				<CirclePlay />
			{:else}
				<CirclePause />
			{/if}
		</IconButton>
		<IconButton onClick={seekToEnd} alt={lang().controls_pane.playback.seek_to_end}>
			<SkipForward />
		</IconButton>
	</div>
	<div class="group">
		<input type="range" min="0" max="100" value={sliderValue} class="slider" oninput={onInput} />
		<span class="time-text">{msToMMSS(progressMs)} / {msToMMSS(durationMs)}</span>
	</div>
	<div class="group">
		<SeparatorVertical />
		<IconButton onClick={() => renderer.seekToRelative(-5000)} alt={lang().controls_pane.playback.seek_backwards}>
			<IterationCw />
		</IconButton>
		<IconButton onClick={() => renderer.seekToRelative(5000)} alt={lang().controls_pane.playback.seek_forward}>
			<IterationCcw />
		</IconButton>
		<IconButton
			togglable
			onToggle={(looped) => {
				renderer.shallLoop(looped);
			}}
			alt={lang().controls_pane.playback.loop}
		>
			<Repeat />
		</IconButton>
	</div>
</div>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.container {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		gap: g.$spacing-s;
		margin-right: g.$spacing-2xl;
	}
	div.group {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		flex-wrap: nowrap;
		gap: g.$spacing-s;
	}

	input.slider {
		width: 150px;
	}

	span.time-text {
		@include g.text;
		color: g.$color-text-800;
		width: g.$size-3xl;
		text-align: center;
	}
</style>
