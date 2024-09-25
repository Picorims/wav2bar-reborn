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

	import IconButton from "$lib/components/atoms/IconButton.svelte";
	import SeparatorVertical from "$lib/components/atoms/SeparatorVertical.svelte";
	import { renderer } from "$lib/engine/video/renderer";
	import { msToMMSS } from "$lib/string";
	import { SkipBack, CirclePlay, CirclePause, SkipForward, IterationCw, IterationCcw, Repeat } from "lucide-svelte";
	import { onMount } from "svelte";

    let paused = true;
    let sliderValue = 0;
    let progressMs = 0;
    let durationMs = 0;

    function togglePause() {
        paused = !paused;
        if (paused) {
            // Pause audio
            renderer.pauseTick();
        } else {
            // Play audio
            renderer.play();
        }
    }

    function seekToStart() {
        renderer.seekToStart();
    }
    function seekToEnd() {
        renderer.seekToEnd();
    }

    function updateSlider() {
        if (!renderer) return;
        progressMs = renderer.getProgress();
        durationMs = renderer.getDuration();
        sliderValue = progressMs / durationMs * 100;
    }

    onMount(() => {
		const interval = setInterval(() => {
			updateSlider();
		}, 100);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="container">
    <IconButton onClick={seekToStart}>
        <SkipBack/>
    </IconButton>
    <IconButton onClick={togglePause}>
        {#if paused}
            <CirclePlay/>
        {:else}
            <CirclePause/>
        {/if}
    </IconButton>
    <IconButton onClick={seekToEnd}>
        <SkipForward/>
    </IconButton>
    <input type="range" min="0" max="100" value={sliderValue} class="slider"/>
    <span class="time-text">{msToMMSS(progressMs)} / {msToMMSS(durationMs)}</span>
    <SeparatorVertical/>
    <IconButton>
        <IterationCw/>
    </IconButton>
    <IconButton>
        <IterationCcw/>
    </IconButton>
    <IconButton>
        <Repeat/>
    </IconButton>
</div>

<style lang="scss">
    @use "../../../css/globals_forward.scss" as g;

    div.container {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: g.$spacing-s;
    }

    input.slider {
        width: 150px;
    }

    span.time-text {
        @include g.text;
        color: g.$color-text-800;
        width: g.$size-3xl;
        text-align: center;
    }
</style>