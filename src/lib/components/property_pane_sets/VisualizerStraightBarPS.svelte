<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import CommonProperties from './groups/CommonProperties.svelte';
	import BorderRadiusProperties from './supports/BorderRadiusProperties.svelte';
	import BoxShadowProperties from './supports/BoxShadowProperties.svelte';
	import ColorProperties from './supports/ColorProperties.svelte';
	import VisualizerProperties from './supports/VisualizerProperties.svelte';
</script>

<CommonProperties />
<ColorProperties />
<BorderRadiusProperties />
<BoxShadowProperties />
<VisualizerProperties barProps />
