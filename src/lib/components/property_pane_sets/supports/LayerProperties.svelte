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
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import type { PositiveInt } from '$lib/types/common_types';

	function updateLayer(value: number) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.layer = value as PositiveInt;
			return obj;
		});
	}
</script>

<LabeledInputNumber
	title={$lang.properties.layer.title}
	value={saveManager.activeObjectData?.layer}
	onChange={updateLayer}
/>
