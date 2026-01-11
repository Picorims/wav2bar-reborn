<script lang="ts">
	import IconButton from '$lib/components/atoms/IconButton.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { appState, setZoomLevelPercent } from '$lib/store/app_state.svelte';
	import { lang } from '$lib/store/settings';
	import { ScanSearch, ZoomIn, ZoomOut } from 'lucide-svelte';

	/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors
    
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

    let zoomLevel = $state(appState.zoomLevelPercent);

	function zoomIn() {
        setZoomLevelPercent(appState.zoomLevelPercent + 10);
        zoomLevel = appState.zoomLevelPercent;
    }
	function zoomOut() {
        setZoomLevelPercent(appState.zoomLevelPercent - 10);
        zoomLevel = appState.zoomLevelPercent;
    }
	function resetZoom() {
        setZoomLevelPercent(100);
        zoomLevel = appState.zoomLevelPercent;
    }
</script>

<div class="container">
    <LabeledInputNumber
        defaultValue={appState.zoomLevelPercent}
        min={1}
        max={10000}
        step={1}
        title={$lang.controls_pane.zoom.input_title}
        bind:value={zoomLevel}
        onChange={(value) => setZoomLevelPercent(value)}
    />
    <IconButton onClick={zoomOut} alt={$lang.controls_pane.zoom.zoom_out}>
		<ZoomOut />
	</IconButton>
	<IconButton onClick={zoomIn} alt={$lang.controls_pane.zoom.zoom_in}>
		<ZoomIn />
	</IconButton>
	<IconButton onClick={resetZoom} alt={$lang.controls_pane.zoom.reset_zoom}>
		<ScanSearch />
	</IconButton>
</div>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

    div.container {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		gap: g.$spacing-s;
		margin-right: g.$spacing-2xl;
	}
</style>