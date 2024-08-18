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

    /**
     * Must be defined manually in the parent component.
     */
   export let columns = 1;
</script>

<div class="row" style={`--columns-count: ${columns}`}>
    <slot></slot>
</div>

<style lang="scss">
    @use '../../../css/globals_forward.scss' as g;

    div.row {
        display: grid;
        grid-template-columns: repeat(var(--columns-count), 1fr);
        gap: g.$spacing-s;
        & > :global(*) {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        & > :global(button) {
            @include g.button-secondary;
        }
    }
</style>