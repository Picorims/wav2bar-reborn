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
	import type { Supports_VisualizerBarProps, VisualObject } from "$lib/store/save_structure/save_latest";
	import { lang } from "$lib/store/settings";

    type ObjT = VisualObject & Supports_VisualizerBarProps;
    let data: ObjT | null = null;
    $: $activeObjectData, data = $activeObjectData as ObjT | null;

    function updateBarThickness(value: number) {
        mutateActiveObject<ObjT>((obj) => {
            obj.visualizer_bar_thickness = value as Supports_VisualizerBarProps['visualizer_bar_thickness'];
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