<script lang="ts">
    /*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
   
    import LabeledInputNumber from "$lib/components/atoms/LabeledInputNumber.svelte";
    import { saveManager } from "$lib/store/save.svelte";
    import type { Supports_TimerInnerSpacing, VisualObject } from "$lib/store/save_structure/save_latest";
    import { lang } from "$lib/store/settings";

    type ObjT = VisualObject & Supports_TimerInnerSpacing;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

    function updateTimerInnerSpacing(value: number) {
        saveManager.mutateActiveObject<ObjT>((obj) => {
            obj.inner_spacing = value as Supports_TimerInnerSpacing['inner_spacing'];
            return obj;
        });
    }
</script>

<LabeledInputNumber
    title={$lang.properties.timer_inner_spacing.title}
    min={0}
    step={1}
    unit="px"
    value={data?.inner_spacing}
    onChange={updateTimerInnerSpacing}
/>