<script lang="ts">
    /*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */
	import { fade } from "svelte/transition";

    interface Props {
        title?: string;
        children?: import('svelte').Snippet;
        buttons?: import('svelte').Snippet;
    }

    let { title = "Default Title", children, buttons }: Props = $props();
</script>

<div class="background" transition:fade={{duration: 250}}>
    <div class="modal">
        <h2 class="title">{title}</h2>

        {@render children?.()}
        
        <div class="buttons-container">
            {@render buttons?.()}
        </div>
    </div>
</div>

<style lang="scss">
    @use '../../../lib/css/globals_forward.scss' as g;

    .background {
        position: fixed;
        z-index: 10000;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal {
        @include g.card;
        padding: g.$spacing-l;
        margin: g.$spacing-l;
        min-width: 300px;
        flex: 0 1 auto;
    }

    .title {
        @include g.heading-2;
        text-align: center;
    }

    .buttons-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: g.$spacing-m;
    }
</style>