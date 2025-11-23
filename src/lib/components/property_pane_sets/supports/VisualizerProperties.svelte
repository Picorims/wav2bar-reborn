<script lang="ts">
    /*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
   
    import Accordion from '$lib/components/atoms/Accordion.svelte';
    import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
    import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
    import { saveManager } from '$lib/store/save.svelte';
    import type { VisualObject } from '$lib/store/save_structure/save_latest';
    import type { Supports_VisualizerProps_V4 } from '$lib/store/save_structure/save_v4';
    import { lang } from '$lib/store/settings';
    import VisualizerBarProperties from './VisualizerBarProperties.svelte';
    import VisualizerCircularProperties from './VisualizerCircularProperties.svelte';
    
    interface Props {
       kind?: "circular" | "bar";
    }

    let { kind = "bar" }: Props = $props();

	type ObjT = VisualObject & Supports_VisualizerProps_V4;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function updateVisualizerPointsCount(value: number) {
		if (value < 1) return;
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.visualizer_points_count = value as Supports_VisualizerProps_V4['visualizer_points_count'];
			return obj;
		});
	}

    function updateAnalyzerRangeMin(value: number) {
        saveManager.mutateActiveObject<ObjT>((obj) => {
            obj.visualizer_analyzer_range[0] = value as Supports_VisualizerProps_V4['visualizer_analyzer_range'][0];
            return obj;
        });
    }

    function updateAnalyzerRangeMax(value: number) {
        saveManager.mutateActiveObject<ObjT>((obj) => {
            obj.visualizer_analyzer_range[1] = value as Supports_VisualizerProps_V4['visualizer_analyzer_range'][1];
            return obj;
        });
    }

    function updateSmoothingType(value: string) {
        saveManager.mutateActiveObject<ObjT>((obj) => {
            obj.visualization_smoothing_type = value as Supports_VisualizerProps_V4['visualization_smoothing_type'];
            return obj;
        });
    }

    function updateSmoothingFactor(value: number) {
        saveManager.mutateActiveObject<ObjT>((obj) => {
            obj.visualization_smoothing_factor = value as Supports_VisualizerProps_V4['visualization_smoothing_factor'];
            return obj;
        });
    }
</script>

<Accordion label={$lang.properties.visualizer_props.title} open>
	<LabeledInputNumber
		title={$lang.properties.visualizer_props.points_count}
		min={1}
		step={1}
		value={data?.visualizer_points_count}
        onChange={updateVisualizerPointsCount}
	/>
    <LabeledInputNumber
        title={$lang.properties.visualizer_props.analyzer_range_min}
        min={0}
        step={1}
        max={1023}
        value={data?.visualizer_analyzer_range[0]}
        onChange={updateAnalyzerRangeMin}
    />
    <LabeledInputNumber
        title={$lang.properties.visualizer_props.analyzer_range_max}
        min={0}
        step={1}
        max={1023}
        value={data?.visualizer_analyzer_range[1]}
        onChange={updateAnalyzerRangeMax}
    />
    <LabeledDropdown
        title={$lang.properties.visualizer_props.smoothing_type}
        optionsObj={$lang.properties.visualizer_props.smoothing_types}
        value={data?.visualization_smoothing_type}
        onChange={updateSmoothingType}
    />
    <LabeledInputNumber
        title={$lang.properties.visualizer_props.smoothing_factor}
        min={0}
        step={0.0001}
        value={data?.visualization_smoothing_factor}
        onChange={updateSmoothingFactor}
    />

    {#if kind === "circular"}
        <VisualizerCircularProperties />
    {/if}
    {#if kind === "bar"}
        <VisualizerBarProperties />
    {/if}
</Accordion>
