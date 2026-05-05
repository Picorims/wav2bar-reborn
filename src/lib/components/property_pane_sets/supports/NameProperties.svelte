<script lang="ts">
	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';

	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	function updateName(value: string) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.name = value;
			return obj;
		});
	}
</script>

<LabeledInputText
	title={lang().properties.name.title}
	value={saveManager.activeObjectData?.name}
	onChange={updateName}
/>
