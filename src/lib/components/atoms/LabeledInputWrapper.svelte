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

    import LabelWrapper from './LabelWrapper.svelte';

	export let title = 'title';
</script>

{#if title != ''}
	<LabelWrapper {title}>
		<div class="input">
			<slot></slot>
		</div>
	</LabelWrapper>
{:else}
	<div class="input alone">
		<slot></slot>
	</div>
{/if}

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	div.input {
		@include g.div-input;
	}
    div.input.alone {
        margin: g.$spacing-m 0;
    }
</style>
