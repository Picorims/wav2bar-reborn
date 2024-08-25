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
	import type { VisualObject } from "$lib/store/save_structure/save_latest";
	import { lang } from "$lib/store/settings";

    // see regex negative lookahead for an explanation of script tag exclusion
    const ONE_FILTER_REGEX = new RegExp(/^<filter>((?!<script>).)*<\/filter>$/g);
    const SVG_FILTER_LIST_REGEX = new RegExp(`/^${ONE_FILTER_REGEX.source}(\\[#\\]${ONE_FILTER_REGEX})*$/g`);

    function updateSVGFilters(value: string) {
		mutateActiveObject<VisualObject>((obj) => {
			obj.svg_filter = value;
			return obj;
		});
	}
</script>

<LabeledInputText
	title={$lang.properties.svg_filter.title}
	value={$activeObjectData?.svg_filter}
	onChange={updateSVGFilters}
    pattern={SVG_FILTER_LIST_REGEX}
    required={false}
/>
