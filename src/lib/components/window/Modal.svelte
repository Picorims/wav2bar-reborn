<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		title?: string;
		children?: Snippet;
		buttons?: Snippet;
		/**
		 * Use bind:dialog to get the dialog element reference.
		 */
		dialog: HTMLDialogElement;
		onOpen?: () => void;
		withButtonGap ?: boolean;
	}

	let {
		title = 'Default Title',
		children,
		buttons,
		dialog = $bindable(),
		onOpen = () => {},
		withButtonGap = false,
	}: Props = $props();

	function onToggle() {
		if (dialog.open) {
			onOpen();
		}
	}

	onMount(() => {
		dialog.addEventListener('toggle', onToggle);
		return () => {
			dialog.removeEventListener('toggle', onToggle);
		};
	});
</script>

<dialog bind:this={dialog} class="modal">
	<h2 class="title">{title}</h2>

	{@render children?.()}

	<div class="buttons-container" class:gap={withButtonGap}>
		{@render buttons?.()}
	</div>
</dialog>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	dialog.modal::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		transition: background-color 0.25s ease;
	}

	@starting-style {
		dialog.modal::backdrop {
			background-color: rgba(0, 0, 0, 0);
		}
	}

	dialog.modal {
		@include g.card;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: g.$spacing-l;
		margin: 0;
		min-width: 300px;
		color: g.$color-text;
		border: none;
	}

	.title {
		@include g.heading-2;
		text-align: center;
	}

	.buttons-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-top: g.$spacing-m;
		&.gap {
			gap: g.$spacing-m;
		}
	}
</style>
