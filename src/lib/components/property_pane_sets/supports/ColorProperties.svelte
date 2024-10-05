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

	import LabeledInputColor from "$lib/components/atoms/LabeledInputColor.svelte";
	import { activeObjectData, mutateActiveObject } from "$lib/store/save";
	import type { Supports_Color, VisualObject } from "$lib/store/save_structure/save_latest";
	import { lang } from "$lib/store/settings";

    type ObjT = VisualObject & Supports_Color;

    let data: ObjT | null = null;
    $: $activeObjectData, (data = $activeObjectData as ObjT | null);

    function updateColor(value: string) {
        mutateActiveObject<ObjT>((obj) => {
            obj.color = value as Supports_Color['color'];
            return obj;
        });
    }
</script>

<LabeledInputColor
    title={$lang.properties.color.title}
    value={data?.color}
    defaultValue="#ffffff"
    required
    onChange={updateColor}
/>
