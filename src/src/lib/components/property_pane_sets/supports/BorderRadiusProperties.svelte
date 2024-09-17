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

    import LabeledInputText from "$lib/components/atoms/LabeledInputText.svelte";
	import { activeObjectData, mutateActiveObject } from "$lib/store/save";
	import type { Supports_BorderRadius, VisualObject } from "$lib/store/save_structure/save_latest";
	import { lang } from "$lib/store/settings";

    let data: (VisualObject & Supports_BorderRadius) | null = null;
    $: $activeObjectData, data = $activeObjectData as (VisualObject & Supports_BorderRadius) | null;

    function updateBorderRadius(value: string) {
		mutateActiveObject<VisualObject & Supports_BorderRadius>((obj) => {
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
