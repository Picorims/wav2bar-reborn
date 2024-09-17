<script lang="ts">
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

	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { activeObjectData, mutateActiveObject } from '$lib/store/save';
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import type { Supports_VisualizerProps_V4 } from '$lib/store/save_structure/save_v4';
	import { lang } from '$lib/store/settings';
	import VisualizerBarProperties from './VisualizerBarProperties.svelte';
	import VisualizerCircularProperties from './VisualizerCircularProperties.svelte';

    export let kind: "circular" | "bar" = "bar";

	type ObjT = VisualObject & Supports_VisualizerProps_V4;
	let data: ObjT | null = null;
	$: $activeObjectData, (data = $activeObjectData as ObjT | null);

	function updateVisualizerPointsCount(value: number) {
		if (value < 1) return;
		mutateActiveObject<ObjT>((obj) => {
			obj.visualizer_points_count = value as Supports_VisualizerProps_V4['visualizer_points_count'];
			return obj;
		});
	}

    function updateAnalyzerRangeMin(value: number) {
        mutateActiveObject<ObjT>((obj) => {
            obj.visualizer_analyzer_range[0] = value as Supports_VisualizerProps_V4['visualizer_analyzer_range'][0];
            return obj;
        });
    }

    function updateAnalyzerRangeMax(value: number) {
        mutateActiveObject<ObjT>((obj) => {
            obj.visualizer_analyzer_range[1] = value as Supports_VisualizerProps_V4['visualizer_analyzer_range'][1];
            return obj;
        });
    }

    function updateSmoothingType(value: string) {
        mutateActiveObject<ObjT>((obj) => {
            obj.visualization_smoothing_type = value as Supports_VisualizerProps_V4['visualization_smoothing_type'];
            return obj;
        });
    }

    function updateSmoothingFactor(value: number) {
        mutateActiveObject<ObjT>((obj) => {
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
        step={0.01}
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
