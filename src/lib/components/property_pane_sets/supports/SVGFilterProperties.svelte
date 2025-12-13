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
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';

	// see regex negative lookahead for an explanation of script tag exclusion
	const ONE_FILTER_REGEX = new RegExp(/^<filter>((?!<script>).)*<\/filter>$/g);
	const SVG_FILTER_LIST_REGEX = new RegExp(
		`/^${ONE_FILTER_REGEX.source}(\\[#\\]${ONE_FILTER_REGEX})*$/g`
	);

	function updateSVGFilters(value: string) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.svg_filter = value;
			return obj;
		});
	}
</script>

<LabeledInputText
	title={$lang.properties.svg_filter.title}
	value={saveManager.activeObjectData?.svg_filter}
	onChange={updateSVGFilters}
	pattern={SVG_FILTER_LIST_REGEX}
	required={false}
/>
