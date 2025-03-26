<script lang="ts">
	import { run } from 'svelte/legacy';

	import VisualObjectIcon from '$lib/components/atoms/VisualObjectIcon.svelte';
	import { Log } from '$lib/log/logger';
	import type {
		VisualObjectInterface,
		VisualObject_Type
	} from '$lib/store/save_structure/save_latest';
	import type { UUIDv4 } from '$lib/types/common_types';
	import { saveManager } from '$lib/store/save';

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

	const handleClick = () => {
        saveManager.activeObject = uuid;
    };

	interface Props {
		uuid: UUIDv4;
	}

	let { uuid }: Props = $props();
	let data: VisualObjectInterface<VisualObject_Type> | null = $derived(saveManager.save.objects[uuid]);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="listitem"
    tabindex="0"
	onkeyup={(e) => {if (e.key === 'Enter') handleClick()}}
	onclick={handleClick}
	class="item"
	class:selected={uuid === saveManager.activeObject}
    onfocus={() => {Log.ui.debug("ObjectPaneItem focused.")}}
>
	{#if data}
		<VisualObjectIcon type={data.visual_object_type} />
		<span class="name">{data.name}</span>
	{/if}
</div>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.item {
		display: flex;
		align-items: center;
		gap: g.$spacing-s;
		padding: 0 g.$spacing-s;
		width: 100%;
		height: g.$size-m;
		border-radius: g.$border-radius-s;
		cursor: pointer;
		color: g.$color-text-800;

		&:hover {
			background-color: g.$color-background-200;
		}

		&.selected {
			background-color: g.$color-background-200;
			color: g.$color-text;
		}

		& :global(svg) {
			color: g.$color-background-800;
		}
		&.selected :global(svg) {
			color: g.$color-primary-600;
		}

		& > * {
			flex: 0 0 auto;
		}
	}
	span.name {
		@include g.text;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
