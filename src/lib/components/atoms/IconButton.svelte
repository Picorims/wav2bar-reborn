<script lang="ts">
    /*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

    import type { Snippet } from "svelte";


    interface Props {
        onClick?: () => void;
        variant?: 'primary' | 'secondary' | 'accent';
        children?: Snippet;
    }

    let { onClick = () => {}, variant = 'primary', children }: Props = $props();
</script>

<button onclick={() => onClick()} type="button" class={`icon-button ${variant}`}>
    {@render children?.()}
</button>

<style lang="scss">
    @use '../../../lib/css/globals_forward.scss' as g;
    button.icon-button {
        width: 24px;
        height: 24px;
        background: none;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: g.$anim-fast;
    }

    button.icon-button.accent > :global(svg) {
        stroke: g.$color-accent;
    }

    button.icon-button:hover > :global(svg) {
        transition: g.$anim-fast;
    }
    button.icon-button.primary:hover > :global(svg) {
        stroke: g.$color-primary-500;
    }
    button.icon-button.secondary:hover > :global(svg) {
        stroke: g.$color-secondary-500;
    }
    button.icon-button.accent:hover > :global(svg) {
        stroke: g.$color-accent-700;
    }

    button.icon-button:active {
        transform: scale(0.9);
    }

    button.icon-button > :global(svg) {
        width: 24px;
        height: 24px;
        stroke: g.$color-background-950;
    }
</style>