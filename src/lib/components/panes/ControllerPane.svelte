<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
	*/

	import AudioController from "./controller_pane/AudioController.svelte";

</script>

<div class="card">
	<AudioController/>
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	.card {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-bottom: g.$spacing-l;
		margin-right: g.$spacing-l;
		padding: g.$spacing-m g.$spacing-l;
	}
</style>
