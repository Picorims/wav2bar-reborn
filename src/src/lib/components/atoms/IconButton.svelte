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
    export let onClick: () => void = () => {};
</script>

<button on:click={() => onClick()} type="button" class="icon-button">
    <slot></slot>
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

    button.icon-button:hover > :global(svg) {
        stroke: g.$color-primary-500;
        transition: g.$anim-fast;
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