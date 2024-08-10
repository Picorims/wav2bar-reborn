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

	import { ChevronDown, ChevronRight } from 'lucide-svelte';

	export let label: string;
	export let open: boolean = false;
</script>

<details bind:open>
	<summary>
        <div>
            {#if open}
                <ChevronDown />
            {:else}
                <ChevronRight />
            {/if}
            <span>{label}</span>
        </div>
	</summary>
	<div class="content">
		<slot />
	</div>
</details>

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	summary {
		@include g.text;
		cursor: pointer;
		color: g.$color-text;
		list-style: none;
        
        & > div {
            border: 1px solid g.$color-background-300;
            border-radius: g.$border-radius-s;
            display: flex;
            gap: g.$spacing-s;
            align-items: center;
            height: g.$size-m;
        }

        & :hover {
			background-color: g.$color-background-300;
		}

		& > * {
			flex: 0;
		}

		& > span {
			flex: 1;
		}
	}

	details {
		& ::marker {
			display: none;
		}
	}

	div.content {
		margin-left: g.$spacing-ml;
		padding: g.$spacing-m;
        padding-right: 0;
		border-left: 1px solid g.$color-background-800;
	}
</style>
