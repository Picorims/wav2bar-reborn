<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import VisualObjectIcon from '$lib/components/atoms/VisualObjectIcon.svelte';
	import { Log } from '$lib/log/logger';
	import type {
		VisualObjectInterface,
		VisualObject_Type
	} from '$lib/store/save_structure/save_latest';
	import type { UUIDv4 } from '$lib/types/common_types';
	import { saveManager } from '$lib/store/save.svelte';
	import IconButton from '$lib/components/atoms/IconButton.svelte';
	import { Trash2 } from 'lucide-svelte';
	import TextIconModal from '$lib/components/window/modals/TextIconModal.svelte';
	import { lang } from '$lib/store/settings';

	const handleClick = () => {
		saveManager.activeObject = uuid;
	};

	interface Props {
		uuid: UUIDv4;
	}

	let { uuid }: Props = $props();
	let data: VisualObjectInterface<VisualObject_Type> | null = $derived(
		saveManager.save.objects[uuid]
	);

	let confirmRemoveDialog = $state<HTMLDialogElement>(document.createElement('dialog'));
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="listitem"
	tabindex="0"
	onkeyup={(e) => {
		if (e.key === 'Enter') handleClick();
	}}
	onclick={handleClick}
	class="item"
	class:selected={uuid === saveManager.activeObject}
	onfocus={() => {
		Log.ui.debug('ObjectPaneItem focused.');
	}}
>
	{#if data}
		<VisualObjectIcon type={data.visual_object_type} />
		<span class="name">{data.name}</span>
		<IconButton
			onClick={() => {
				confirmRemoveDialog?.showModal();
			}}
		>
			<Trash2 />
		</IconButton>
	{/if}
</div>

<TextIconModal
	bind:dialog={confirmRemoveDialog}
	mode="confirm"
	kind="danger"
	title={$lang.modal.confirm_remove_object.title}
	description={$lang.modal.confirm_remove_object.description}
	confirmText={$lang.modal.confirm_remove_object.confirm}
	cancelText={$lang.modal.confirm_remove_object.cancel}
	onConfirm={() => {
		saveManager.removeObject(uuid);
	}}
/>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.item {
		display: flex;
		align-items: center;
		gap: g.$spacing-s;
		padding: 0 g.$spacing-s;
		width: 100%;
		height: g.$size-m;
		border-radius: g.$border-radius-s;
		cursor: pointer;
		color: g.$color-text-800;

		&:hover {
			background-color: g.$color-background-200;
		}

		&.selected {
			background-color: g.$color-background-200;
			color: g.$color-text;
		}

		& :global(svg) {
			color: g.$color-background-800;
		}
		&.selected :global(svg) {
			color: g.$color-primary-600;
		}

		& > * {
			flex: 0 0 auto;
		}
	}
	span.name {
		@include g.text;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
