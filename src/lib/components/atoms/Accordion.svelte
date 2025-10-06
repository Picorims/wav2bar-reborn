<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

    interface Props {
        label: string;
        open?: boolean;
        children?: Snippet;
    }

    let { label, open = $bindable(false), children }: Props = $props();
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
		{@render children?.()}
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
