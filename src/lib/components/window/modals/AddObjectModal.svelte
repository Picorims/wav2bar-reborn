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
	import type { VisualObject_Type } from '$lib/store/save_structure/save_latest';

	import shapeIcon from '$lib/icons/visual_objects/shape.svg?raw';
	import textIcon from '$lib/icons/visual_objects/text.svg?raw';
	import particleFlowIcon from '$lib/icons/visual_objects/particle_flow.svg?raw';
	import timerStraightBarIcon from '$lib/icons/visual_objects/timer_straight_bar.svg?raw';
	import timerStraightLinePointIcon from '$lib/icons/visual_objects/timer_straight_line_point.svg?raw';
	import visualizerStraightBarIcon from '$lib/icons/visual_objects/visualizer_straight_bar.svg?raw';
	import visualizerCircularBarIcon from '$lib/icons/visual_objects/visualizer_circular_bar.svg?raw';
	import visualizerStraightWaveIcon from '$lib/icons/visual_objects/visualizer_straight_wave.svg?raw';

	interface Props {
		dialog: HTMLDialogElement;
		onTypeChosen: (type: VisualObject_Type) => void;
	}

	const categories = ["general", "timer", "visualizer"] as const;
	type Category = typeof categories[number];
	interface Entry {
		label: string;
		category: Category;
		iconSvg: string;
	}

	const entries: Record<VisualObject_Type, Entry> = {
		shape: {
			label: $lang.modal.add_object.visual_object_types.shape,
			category: "general",
			iconSvg: shapeIcon,
		},
		text: {
			label: $lang.modal.add_object.visual_object_types.text,
			category: "general",
			iconSvg: textIcon,
		},
		particle_flow: {
			label: $lang.modal.add_object.visual_object_types.particle_flow,
			category: "general",
			iconSvg: particleFlowIcon,
		},
		timer_straight_bar: {
			label: $lang.modal.add_object.visual_object_types.timer_straight_bar,
			category: "timer",
			iconSvg: timerStraightBarIcon,
		},
		timer_straight_line_point: {
			label: $lang.modal.add_object.visual_object_types.timer_straight_line_point,
			category: "timer",
			iconSvg: timerStraightLinePointIcon,
		},
		visualizer_straight_bar: {
			label: $lang.modal.add_object.visual_object_types.visualizer_straight_bar,
			category: "visualizer",
			iconSvg: visualizerStraightBarIcon,
		},
		visualizer_circular_bar: {
			label: $lang.modal.add_object.visual_object_types.visualizer_circular_bar,
			category: "visualizer",
			iconSvg: visualizerCircularBarIcon,
		},
		visualizer_straight_wave: {
			label: $lang.modal.add_object.visual_object_types.visualizer_straight_wave,
			category: "visualizer",
			iconSvg: visualizerStraightWaveIcon,
		}
	};

	let { dialog = $bindable(), onTypeChosen }: Props = $props();
</script>

<Modal bind:dialog title={$lang.modal.add_object.title}>
	<div class="scrollable-picker">
		{#each categories as category}
			<h3>{ $lang.modal.add_object.categories[category] }</h3>
			{@render typeButtons(category)}
		{/each}
	</div>
	{#snippet buttons()}
		<button class="close" onclick={() => {dialog?.close()}}>{$lang.modal.add_object.close}</button>
	{/snippet}
</Modal>

{#snippet typeButtons(category: Category)}
	{#each Object.entries(entries).filter(([_, e]) => e.category === category) as [type, entry]}
		<button class="type-button" aria-label={$lang.modal.add_object.categories[category] + ": " + entry.label} onclick={() => {
			dialog?.close();
			onTypeChosen(type as VisualObject_Type /*type is lost after calling entries()*/);
		}}>
			<!-- svg icon -->
			<span role="img" aria-label={entry.label}>{@html entry.iconSvg}</span>
			<span>{entry.label}</span>
		</button>
	{/each}
{/snippet}

<style lang="scss">
	@use '../../../../lib/css/globals_forward.scss' as g;
	.close {
		@include g.button-primary;
	}
	.scrollable-picker {
		max-height: 400px;
		min-width: 400px;
		overflow-y: auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: g.$spacing-l;
		margin-bottom: g.$spacing-m;
		background-color: g.$color-background-50;
		border-radius: g.$border-radius-m;
		padding: g.$spacing-l;
	}
	h3 {
		@include g.heading-3;
		// fill all columns
		grid-column: 1 / -1;
		margin-top: g.$spacing-m;
		margin-bottom: g.$spacing-s;
		border-top: 1px solid g.$color-text-900;
		padding-top: g.$spacing-s;
	}
	.type-button {
		@include g.button-secondary;
		--size: 6rem;
		width: var(--size);
		min-width: var(--size);
		max-width: var(--size);
		height: var(--size);
		min-height: var(--size);
		max-height: var(--size);

		border: none;
		background-color: transparent;

		padding: 0.25rem;
		display: grid;
		grid-template-rows: 48px auto;
		justify-items: center;
		gap: g.$spacing-s;

		:global(svg) {
			width: 48px;
			height: 48px;
		}

		:global(svg *) {
			stroke: g.$color-primary !important;
		}
	}
</style>
