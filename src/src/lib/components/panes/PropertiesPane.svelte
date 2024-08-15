<script lang="ts">
	import { activeObjectData } from '$lib/store/save';
	import { AlignCenter } from 'lucide-svelte';
	import Accordion from '../atoms/Accordion.svelte';
	import Button from '../atoms/buttons_group/Button.svelte';
	import ButtonsGroup from '../atoms/buttons_group/ButtonsGroup.svelte';
	import ButtonsRow from '../atoms/buttons_group/ButtonsRow.svelte';
	import LabeledInputNumber from '../atoms/LabeledInputNumber.svelte';
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

	import VisualObjectIcon from '../atoms/VisualObjectIcon.svelte';
	import ParticleFlowPs from '../property_pane_sets/ParticleFlowPS.svelte';
	import ShapePs from '../property_pane_sets/ShapePS.svelte';
	import TextPs from '../property_pane_sets/TextPS.svelte';
	import TimerStraightBarPs from '../property_pane_sets/TimerStraightBarPS.svelte';
	import TimerStraightLinePointPs from '../property_pane_sets/TimerStraightLinePointPS.svelte';
	import VisualizerCircularBarPs from '../property_pane_sets/VisualizerCircularBarPS.svelte';
	import VisualizerStraightWavePs from '../property_pane_sets/VisualizerStraightWavePS.svelte';
	import VisualizerStraightBarPs from '../property_pane_sets/VisualizerStraightBarPS.svelte';
</script>

<div class="card">
	{#if $activeObjectData}
		<div class="card-header">
			<VisualObjectIcon type={$activeObjectData.visual_object_type} />
			<span class="title">{$activeObjectData.name}</span>
		</div>
		<div class="content">
			{#if $activeObjectData.visual_object_type === 'particle_flow'}
				<ParticleFlowPs />
			{:else if $activeObjectData.visual_object_type === 'shape'}
				<ShapePs />
			{:else if $activeObjectData.visual_object_type === 'text'}
				<TextPs />
			{:else if $activeObjectData.visual_object_type === 'timer_straight_bar'}
				<TimerStraightBarPs />
			{:else if $activeObjectData.visual_object_type === 'timer_straight_line_point'}
				<TimerStraightLinePointPs />
			{:else if $activeObjectData.visual_object_type === 'visualizer_circular_bar'}
				<VisualizerCircularBarPs />
			{:else if $activeObjectData.visual_object_type === 'visualizer_straight_bar'}
				<VisualizerStraightBarPs />
			{:else if $activeObjectData.visual_object_type === 'visualizer_straight_wave'}
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
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-bottom: g.$spacing-l;
		margin-left: g.$spacing-l;
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
