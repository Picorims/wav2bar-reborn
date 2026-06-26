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
	import { Info, MessageCircleWarning, OctagonX, TriangleAlert } from 'lucide-svelte';
	const ICON_SIZE = 64;

	interface Props {
		dialog: HTMLDialogElement;
		mode: 'confirm' | 'alert';
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
	<div class="content {kind}">
		<div class="icon">
			{#if kind === 'danger'}
				<MessageCircleWarning size={ICON_SIZE} />
			{:else if kind === 'warning'}
				<TriangleAlert size={ICON_SIZE} />
			{:else if kind === 'info'}
				<Info size={ICON_SIZE} />
			{:else if kind === 'error'}
				<OctagonX size={ICON_SIZE} />
			{/if}
		</div>
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
				}}>{cancelText ?? lang().modal.text_icon.cancel}</button
			>
			<button
				class="buttons confirm {kind}"
				onclick={() => {
					onConfirm();
					dialog?.close();
				}}>{confirmText ?? lang().modal.text_icon.confirm}</button
			>
		{:else if mode === 'alert'}
			<button
				class="buttons confirm {kind}"
				onclick={() => {
					onConfirm();
					dialog?.close();
				}}>{confirmText ?? lang().modal.text_icon.ok}</button
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
		&.danger {
			@include g.button-danger;
		}
	}
	div.content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: g.$spacing-m;
	}
	div.icon {
		min-width: g.$size-xl;
	}
	div.content.danger > .icon > :global(svg) {
		stroke: g.$color-status-error;
	}
	div.content.error > .icon > :global(svg) {
		stroke: g.$color-status-error;
	}
	div.content.warning > .icon > :global(svg) {
		stroke: g.$color-status-warning;
	}
	div.content.info > .icon > :global(svg) {
		stroke: g.$color-status-info;
	}
	p {
		@include g.text;
		margin-top: g.$spacing-m;
		white-space: pre-wrap;
	}
</style>
