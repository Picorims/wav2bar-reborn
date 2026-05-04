<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import Modal from '../Modal.svelte';
	import { lang } from '$lib/store/settings';
	import { Info, MessageCircleWarning, OctagonX, TriangleAlert } from 'lucide-svelte';

	interface Props {
		dialog: HTMLDialogElement;
		mode: 'confirm';
		kind: 'danger' | 'warning' | 'info' | 'error';
		onConfirm?: () => void;
		onCancel?: () => void;
		title: string;
		description: string;
		confirmText?: string;
		cancelText?: string;
	}

	let {
		dialog = $bindable(),
		onConfirm = () => {},
		onCancel = () => {},
		title,
		description,
		kind,
		mode,
		confirmText,
		cancelText
	}: Props = $props();
</script>

<Modal bind:dialog {title}>
	<div class="content">
		{#if kind === 'danger'}
			<MessageCircleWarning />
		{:else if kind === 'warning'}
			<TriangleAlert />
		{:else if kind === 'info'}
			<Info />
		{:else if kind === 'error'}
			<OctagonX />
		{/if}
		<p>
			{description}
		</p>
	</div>

	{#snippet buttons()}
		{#if mode === 'confirm'}
			<button
				class="buttons cancel"
				onclick={() => {
					onCancel();
					dialog?.close();
				}}>{cancelText ?? $lang.modal.text_icon.cancel}</button
			>
			<button
				class="buttons confirm"
				class:kind
				onclick={() => {
					onConfirm();
					dialog?.close();
				}}>{confirmText ?? $lang.modal.text_icon.confirm}</button
			>
		{/if}
	{/snippet}
</Modal>

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
	.close {
		@include g.button-primary;
	}
	button.buttons {
		@include g.button-secondary;
        margin-right: g.$spacing-s;
	}
	p {
		@include g.text;
		margin-top: g.$spacing-m;
	}
</style>
