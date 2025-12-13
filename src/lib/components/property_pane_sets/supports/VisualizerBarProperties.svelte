<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type {
		Supports_VisualizerBarProps,
		VisualObject
	} from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';

	type ObjT = VisualObject & Supports_VisualizerBarProps;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function updateBarThickness(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.visualizer_bar_thickness =
				value as Supports_VisualizerBarProps['visualizer_bar_thickness'];
			return obj;
		});
	}
</script>

<LabeledInputNumber
	title={$lang.properties.visualizer_bar_props.bar_thickness}
	min={0}
	step={1}
	unit="px"
	value={data?.visualizer_bar_thickness}
	onChange={updateBarThickness}
/>
