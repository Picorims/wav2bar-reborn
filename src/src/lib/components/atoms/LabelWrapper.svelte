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

	export let title: string;
    export let fixedLabelWidth = true;
</script>

<label class="container">
	<span class="label" class:fixedLabelWidth>{title}:</span>
	<slot />
</label>

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	label.container {
		display: flex;
		align-items: center;
        justify-content: space-between;
        margin: g.$spacing-m 0;
	}

	span.label {
		flex: 0 1 auto;
        margin: g.$spacing-s 0;
        margin-right: g.$spacing-m;

        &.fixedLabelWidth {
            width: 40%;
            flex: 0 0 auto;
        }
	}
</style>
