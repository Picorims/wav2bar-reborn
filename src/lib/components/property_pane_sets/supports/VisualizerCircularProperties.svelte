<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type {
		Supports_VisualizerCircularProps,
		VisualObject
	} from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';

	type ObjT = VisualObject & Supports_VisualizerCircularProps;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function updateRadius(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.visualizer_radius = value as Supports_VisualizerCircularProps['visualizer_radius'];
			return obj;
		});
	}
</script>

<LabeledInputNumber
	title={lang().properties.visualizer_circular_props.radius}
	min={0}
	step={1}
	unit="px"
	value={data?.visualizer_radius}
	onChange={updateRadius}
/>
