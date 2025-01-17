<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (C) 2024  Picorims <picorims.contact@gmail.com>
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
	*/
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { GripHorizontal, GripVertical } from 'lucide-svelte';
    import ObjectPane from '$lib/components/panes/ObjectPane.svelte';
	import PropertiesPane from '$lib/components/panes/PropertiesPane.svelte';
	import ControllerPane from '$lib/components/panes/ControllerPane.svelte';
	import FileAndIconsPane from '$lib/components/panes/FileAndIconsPane.svelte';
	import Modal from '$lib/components/window/Modal.svelte';
	import { currentModal, ModalType } from '../../store/modal';
	import SettingsModal from './modals/SettingsModal.svelte';
	import Renderer from '$lib/components/atoms/Renderer.svelte';
	import { minPercentFrom, maxPercentFrom, ratio, ratioToPercent } from '$lib/math';

	let saved = false;
	let projectTitle = "New Project";
	let windowWidth: number;
	let windowHeight: number;
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight}/>

<Splitpanes
	class="main-split-pane"
	theme="custom-theme"
>
	<Pane
		snapSize={maxPercentFrom(15, ratio(200, windowWidth))}
		maxSize={minPercentFrom(75, ratio(1280, windowWidth))}
		size={minPercentFrom(50, [300, windowWidth])}
	>
        <GripVertical class="grip-vertical"/>
		<div class="side-pane-padding">
			<Splitpanes horizontal theme="custom-theme">
				<Pane minSize={ratioToPercent(200, windowHeight)}>
					<GripHorizontal class="grip-horizontal"/>
					<div class="flex-column">
						<div class="file-and-icons-pane-container">
							<FileAndIconsPane title={projectTitle} saved={saved}/>
						</div>
						<div class="objects-pane-container">
							<ObjectPane/>
						</div>
					</div>
				</Pane>
				<Pane minSize={ratioToPercent(200, windowHeight)}>
					<PropertiesPane/>
				</Pane>
			</Splitpanes>
		</div>
	</Pane>
	<Pane>
		<div class="flex-column">
			<div class="screen-container">
				<Renderer/>
			</div>
			<div class="bottom-pane-container">
				<ControllerPane/>
			</div>
		</div>
	</Pane>
</Splitpanes>

{#if $currentModal === ModalType.PROJECT_SETTINGS}
	<Modal title="Project Settings">
		<p>Project settings go here</p>
		<button on:click={() => {currentModal.set(null)}}>Close</button>
	</Modal>
{:else if $currentModal === ModalType.SETTINGS}
	<SettingsModal/>
{/if}

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
	div.screen-container, div.objects-pane-container {
		flex: 1;
	}
	div.screen-container {
		min-height: 0;
	}
	div.bottom-pane-container, div.file-and-icons-pane-container {
		min-height: fit-content;
	}
	div.objects-pane-container {
		min-height: 0;
	}
</style>
