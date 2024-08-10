<script lang="ts">
	import type { VisualObject_Type } from '$lib/store/save_structure/save_latest';
	import { AudioLines, Box, Clock, Shapes, Sparkles, Type } from 'lucide-svelte';

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

	export let type: VisualObject_Type;
</script>

{#if type === 'particle_flow'}
	<Sparkles />
{:else if type === 'text'}
	<Type />
{:else if type === 'shape'}
	<Shapes />
{:else if type === 'timer_straight_bar' || type === 'timer_straight_line_point'}
	<Clock />
{:else if type === 'visualizer_circular_bar' || type === 'visualizer_straight_bar' || type === 'visualizer_straight_wave'}
	<AudioLines />
{:else}
	<Box />
{/if}
