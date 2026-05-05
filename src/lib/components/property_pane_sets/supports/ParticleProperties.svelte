<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_ParticleProps, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';

	type ObjT = VisualObject & Supports_ParticleProps;

	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function updateRadiusMin(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.particle_radius_range[0] = value as Supports_ParticleProps['particle_radius_range'][0];
			return obj;
		});
	}

	function updateRadiusMax(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.particle_radius_range[1] = value as Supports_ParticleProps['particle_radius_range'][1];
			return obj;
		});
	}

	function updateFlowType(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.flow_type = value as Supports_ParticleProps['flow_type'];
			return obj;
		});
	}

	function updateFlowCenterX(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.flow_center[0] = value as Supports_ParticleProps['flow_center'][0];
			return obj;
		});
	}

	function updateFlowCenterY(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.flow_center[1] = value as Supports_ParticleProps['flow_center'][1];
			return obj;
		});
	}

	function updateFlowDirection(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.flow_direction = value as Supports_ParticleProps['flow_direction'];
			return obj;
		});
	}

	function updateSpawnProbability(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.particle_spawn_probability =
				value as Supports_ParticleProps['particle_spawn_probability'];
			return obj;
		});
	}

	function updateSpawnTests(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.particle_spawn_tests = value as Supports_ParticleProps['particle_spawn_tests'];
			return obj;
		});
	}
</script>

<Accordion label={lang().properties.particle_flow_props.title} open>
	<LabeledInputNumber
		title={lang().properties.particle_flow_props.radius_min}
		unit={'px'}
		min={1}
		value={data?.particle_radius_range[0]}
		onChange={updateRadiusMin}
	/>
	<LabeledInputNumber
		title={lang().properties.particle_flow_props.radius_max}
		unit={'px'}
		min={1}
		value={data?.particle_radius_range[1]}
		onChange={updateRadiusMax}
	/>
	<LabeledDropdown
		title={lang().properties.particle_flow_props.flow_type}
		optionsObj={lang().properties.particle_flow_props.flow_types}
		value={data?.flow_type}
		onChange={updateFlowType}
	/>
	{#if data?.flow_type === 'radial'}
		<LabeledInputNumber
			title={lang().properties.particle_flow_props.center_x}
			unit={'px'}
			value={data?.flow_center[0]}
			onChange={updateFlowCenterX}
		/>
		<LabeledInputNumber
			title={lang().properties.particle_flow_props.center_y}
			unit={'px'}
			value={data?.flow_center[1]}
			onChange={updateFlowCenterY}
		/>
	{/if}
	{#if data?.flow_type === 'directional'}
		<LabeledInputNumber
			title={lang().properties.particle_flow_props.direction}
			unit={'deg'}
			value={data?.flow_direction}
			min={0}
			max={360}
			onChange={updateFlowDirection}
		/>
	{/if}
	<LabeledInputNumber
		title={lang().properties.particle_flow_props.spawn_probability}
		value={data?.particle_spawn_probability}
		min={0}
		max={1}
		step={0.01}
		onChange={updateSpawnProbability}
	/>
	<LabeledInputNumber
		title={lang().properties.particle_flow_props.spawn_tests}
		value={data?.particle_spawn_tests}
		min={1}
		onChange={updateSpawnTests}
	/>
</Accordion>
