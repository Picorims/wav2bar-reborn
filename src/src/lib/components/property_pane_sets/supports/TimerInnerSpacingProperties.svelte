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

	import LabeledInputNumber from "$lib/components/atoms/LabeledInputNumber.svelte";
	import { mutateActiveObject, activeObjectData } from "$lib/store/save";
	import type { Supports_TimerInnerSpacing, VisualObject } from "$lib/store/save_structure/save_latest";
	import { lang } from "$lib/store/settings";

    type ObjT = VisualObject & Supports_TimerInnerSpacing;
    let data: ObjT | null = null;

    $: $activeObjectData, data = $activeObjectData as ObjT | null;

    function updateTimerInnerSpacing(value: number) {
        mutateActiveObject<ObjT>((obj) => {
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