<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import type { VisualObject_Type } from '$lib/store/save_structure/save_latest';
	import { AudioLines, Box, Clock, Shapes, Sparkles, Type } from 'lucide-svelte';

	interface Props {
		type: VisualObject_Type;
	}

	let { type }: Props = $props();
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
