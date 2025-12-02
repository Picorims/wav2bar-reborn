<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/

	import { lang } from '$lib/store/settings';
	import { PlusCircle, Redo, Undo } from 'lucide-svelte';
	import IconButton from '../atoms/IconButton.svelte';
	import {
		visualObject_types,
		type VisualObject_Type
	} from '$lib/store/save_structure/save_latest';
	import { saveManager } from '$lib/store/save.svelte';
	import ObjectPaneItem from './object_pane/ObjectPaneItem.svelte';
	import AddObjectModal from '../window/modals/AddObjectModal.svelte';

	let addObjectModalDialog: HTMLDialogElement = $state(document.createElement("dialog"));

	function newObj() {
		addObjectModalDialog?.showModal();
	}

	let listDiv: HTMLDivElement | undefined = $state();
	function enterList(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			(listDiv?.children[0] as HTMLDivElement).focus();
		}
	}

	function createObject(type: VisualObject_Type) {
		saveManager.addObject(type);
	}
</script>

<div class="card">
	<div class="header">
		<span class="title">{$lang.object_pane.title}</span>
		<div class="header-buttons">
			<IconButton onClick={() => alert("coming soon!")}>
				<Undo />
			</IconButton>
			<IconButton onClick={() => alert("coming soon!")}>
				<Redo />
			</IconButton>
			<IconButton variant="accent" onClick={newObj}>
				<PlusCircle />
			</IconButton>
		</div>
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={listDiv}
		class="content"
		role="list"
		onkeyup={enterList}
		tabindex="-1"
	>
		<!-- Content -->
		{#each Object.keys(saveManager.save.objects) as k}
			<ObjectPaneItem uuid={k} />
		{/each}
	</div>

	<AddObjectModal bind:dialog={addObjectModalDialog} onTypeChosen={createObject} />
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	div.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: calc(100% - g.$spacing-l);
		max-height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-top: g.$spacing-l;
		padding: g.$spacing-m;
	}

	div.header {
		height: g.$size-m;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid g.$color-background-800;
	}
	span.title {
		@include g.heading-3;
	}
	div.header-buttons {
		display: flex;
		gap: g.$spacing-s;
	}

	div.content {
		height: 100%;
		overflow-y: scroll;
	}
</style>
