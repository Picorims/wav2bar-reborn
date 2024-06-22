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
	import { fade } from "svelte/transition";

    export let title = "Default Title";
</script>

<div class="background" transition:fade={{duration: 250}}>
    <div class="modal">
        <h2 class="title">{title}</h2>
        <slot></slot>
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
</style>