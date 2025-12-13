<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors
	
	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/
	
	import { saveManager } from '$lib/store/save.svelte';
	import VisualObjectIcon from '../atoms/VisualObjectIcon.svelte';
	import ParticleFlowPs from '../property_pane_sets/ParticleFlowPS.svelte';
	import ShapePs from '../property_pane_sets/ShapePS.svelte';
	import TextPs from '../property_pane_sets/TextPS.svelte';
	import TimerStraightBarPs from '../property_pane_sets/TimerStraightBarPS.svelte';
	import TimerStraightLinePointPs from '../property_pane_sets/TimerStraightLinePointPS.svelte';
	import VisualizerCircularBarPs from '../property_pane_sets/VisualizerCircularBarPS.svelte';
	import VisualizerStraightWavePs from '../property_pane_sets/VisualizerStraightWavePS.svelte';
	import VisualizerStraightBarPs from '../property_pane_sets/VisualizerStraightBarPS.svelte';

	const data = $derived(saveManager.activeObjectData);
</script>

<div class="card">
	{#if data}
		<div class="card-header">
			<VisualObjectIcon type={data.visual_object_type} />
			<span class="title">{data.name}</span>
		</div>
		<div class="content">
			{#if data.visual_object_type === 'particle_flow'}
				<ParticleFlowPs />
			{:else if data.visual_object_type === 'shape'}
				<ShapePs />
			{:else if data.visual_object_type === 'text'}
				<TextPs />
			{:else if data.visual_object_type === 'timer_straight_bar'}
				<TimerStraightBarPs />
			{:else if data.visual_object_type === 'timer_straight_line_point'}
				<TimerStraightLinePointPs />
			{:else if data.visual_object_type === 'visualizer_circular_bar'}
				<VisualizerCircularBarPs />
			{:else if data.visual_object_type === 'visualizer_straight_bar'}
				<VisualizerStraightBarPs />
			{:else if data.visual_object_type === 'visualizer_straight_wave'}
				<VisualizerStraightWavePs />
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	div.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		@include g.card;
		overflow: hidden;
	}

	div.card-header {
		width: 100%;
		max-width: 100%;
		display: flex;
		align-items: center;
		gap: g.$spacing-s;
		padding: g.$spacing-s g.$spacing-m;
		background-color: g.$color-background-200;

		& > :global(*) {
			flex: 0 0 auto;
		}

		& > :global(svg) {
			color: g.$color-primary-600;
		}
	}

	span.title {
		min-width: 0;
		flex: 0 1 auto;
		@include g.text-strong;
		color: g.$color-text;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	div.content {
		flex: 1 1 auto;
		min-width: 0;
		overflow-x: hidden;
		overflow-y: scroll;
		padding: g.$spacing-m;
	}
</style>
