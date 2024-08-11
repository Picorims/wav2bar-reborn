<script lang="ts">
	import { activeObjectData } from "$lib/store/save";
	import Accordion from "../atoms/Accordion.svelte";
	import LabeledInputNumber from "../atoms/LabeledInputNumber.svelte";
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

	import VisualObjectIcon from "../atoms/VisualObjectIcon.svelte";

</script>

<div class="card">
	{#if $activeObjectData}
		<div class="card-header">
			<VisualObjectIcon type={$activeObjectData.visual_object_type}/>
			<span class="title">{$activeObjectData.name}</span>
		</div>
		<div class="content">
			<Accordion label="name" open>
				<span>stuff</span>
				<Accordion label="nested">
					<span>wow</span>
				</Accordion>
				<LabeledInputNumber placeholder="something" title="nice title" unit={"px"} min={0} />
			</Accordion>
		</div>
	{/if}
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	div.card {
		display: flex;
		flex-direction: column;
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-bottom: g.$spacing-l;
		margin-left: g.$spacing-l;
		overflow: hidden;
	}

	div.card-header {
		width: 100%;
		max-width: 100%;
		display: flex;
		align-items: center;
		gap: g.$spacing-s;
		padding: g.$spacing-s g.$spacing-m;
		background-color: g.$color-background-200;

		& > :global(*) {
			flex: 0 0 auto;
		}

		& > :global(svg) {
			color: g.$color-primary-600;
		}
	}

	span.title {
		min-width: 0;
		flex: 0 1 auto;
		@include g.text-strong;
		color: g.$color-text;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	div.content {
		flex: 1 1 auto;
		min-width: 0;
		overflow-x: hidden;
		overflow-y: scroll;
		padding: g.$spacing-m;
	}
</style>
