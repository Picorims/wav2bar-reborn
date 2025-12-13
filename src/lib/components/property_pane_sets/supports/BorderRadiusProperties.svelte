<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_BorderRadius, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';

	type ObjT = VisualObject & Supports_BorderRadius;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function updateBorderRadius(value: string) {
		saveManager.mutateActiveObject<VisualObject & Supports_BorderRadius>((obj) => {
			obj.border_radius = value;
			return obj;
		});
	}
</script>

<LabeledInputText
	title={$lang.properties.border_radius.title}
	value={data?.border_radius}
	onChange={updateBorderRadius}
	required={false}
/>
