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
	import IconButton from "../atoms/IconButton.svelte";
	import { FileCog, FilePlus, FolderOpen, Save, Settings, HelpCircle } from "lucide-svelte";
	import { currentModal, ModalType } from "$lib/store/modal";
	import { openModalHandler } from "$lib/store/modal";

	export let title = "";
	export let saved = false;
</script>

<div class="card">
	<span class="project-title">{title}{saved? "" : "*"}</span>
	<IconButton onClick={() => {currentModal.set(ModalType.PROJECT_SETTINGS)}}>
		<FileCog/>
	</IconButton>
	<IconButton>
		<FilePlus/>
	</IconButton>
	<IconButton>
		<FolderOpen/>
	</IconButton>
	<IconButton>
		<Save/>
	</IconButton>
	<IconButton onClick={openModalHandler(ModalType.SETTINGS)}>
		<Settings/>
	</IconButton>
	<IconButton>
		<HelpCircle/>
	</IconButton>
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	.card {
		display: flex;
		gap: g.$spacing-s;
		align-items: center;
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-top: g.$spacing-l;
		margin-left: g.$spacing-l;
		padding: g.$spacing-m;
	}

	span.project-title {
		@include g.text-strong;
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		text-wrap: nowrap;
	}
</style>
