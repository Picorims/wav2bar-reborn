<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { GripHorizontal, GripVertical } from 'lucide-svelte';
	import ObjectPane from '$lib/components/panes/ObjectPane.svelte';
	import PropertiesPane from '$lib/components/panes/PropertiesPane.svelte';
	import ControllerPane from '$lib/components/panes/ControllerPane.svelte';
	import FileAndIconsPane from '$lib/components/panes/FileAndIconsPane.svelte';
	import Renderer from '$lib/components/atoms/Renderer.svelte';
	import { minPercentFrom, maxPercentFrom, ratio, ratioToPercent } from '$lib/math';
	import LoadingLockScreen from './LoadingLockScreen.svelte';
	import { appState } from '$lib/store/app_state.svelte';

	let saved = false;
	let projectTitle = 'New Project';
	let windowWidth: number = $state(1);
	let windowHeight: number = $state(1);
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<Splitpanes class="main-split-pane" theme="custom-theme">
	<Pane
		snapSize={maxPercentFrom(15, ratio(200, windowWidth))}
		maxSize={minPercentFrom(75, ratio(1280, windowWidth))}
		size={minPercentFrom(50, [300, windowWidth])}
	>
		<GripVertical class="grip-vertical" />
		<div class="side-pane-padding">
			<Splitpanes horizontal theme="custom-theme">
				<Pane minSize={ratioToPercent(200, windowHeight)}>
					<GripHorizontal class="grip-horizontal" />
					<div class="flex-column">
						<div class="file-and-icons-pane-container">
							<FileAndIconsPane title={projectTitle} {saved} />
						</div>
						<div class="objects-pane-container">
							<ObjectPane />
						</div>
					</div>
				</Pane>
				<Pane minSize={ratioToPercent(200, windowHeight)}>
					<PropertiesPane />
				</Pane>
			</Splitpanes>
		</div>
	</Pane>
	<Pane>
		<div class="flex-column">
			<div class="screen-container">
				<Renderer />
			</div>
			<div class="bottom-pane-container">
				<ControllerPane />
			</div>
		</div>
	</Pane>
</Splitpanes>

<LoadingLockScreen enabled={appState.loading} />

<audio id="audio"></audio>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;
	div.flex-column {
		width: 100%;
		height: 100%;
		max-height: 100%;
		display: flex;
		flex-direction: column;
	}
	div.flex-column > div {
		width: 100%;
	}
	div.side-pane-padding {
		padding: g.$spacing-l;
		padding-right: 0;
		width: 100%;
		height: 100%;
	}
	div.screen-container,
	div.objects-pane-container {
		flex: 1;
	}
	div.screen-container {
		min-height: 0;
	}
	div.bottom-pane-container,
	div.file-and-icons-pane-container {
		min-height: fit-content;
	}
	div.objects-pane-container {
		min-height: 0;
	}
</style>
