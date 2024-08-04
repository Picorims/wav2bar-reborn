<script lang="ts">
	import { lang } from "$lib/store/settings";
	import { PlusCircle, Redo, Undo } from "lucide-svelte";
	import IconButton from "../atoms/IconButton.svelte";

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
</script>

<div class="card">
	<div class="header">
		<span class="title">{$lang.object_pane.title}</span>
		<div class="header-buttons">
			<IconButton>
				<Undo/>
			</IconButton>
			<IconButton>
				<Redo/>
			</IconButton>
			<IconButton variant="accent">
				<PlusCircle/>
			</IconButton>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	div.card {
		display: flex;
		flex-direction: column;
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-top: g.$spacing-l;
		margin-left: g.$spacing-l;
		padding: g.$spacing-m;
	}

	div.header {
		height: g.$size-m;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid g.$color-background-800;
	}
	span.title {
		@include g.heading-3;
	}
	div.header-buttons {
		display: flex;
		gap: g.$spacing-s;
	}
</style>
