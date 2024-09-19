<script lang="ts">
	import { renderer, Renderer } from "$lib/engine/video/renderer";
	import { getContext, onMount } from "svelte";

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

    let canvas: HTMLCanvasElement | undefined;
    
    onMount(async () => {
        await renderer.init(1280, 720, 60);
        canvas = renderer.getCanvas();
        document.getElementById("pixi-canvas-div")?.appendChild(canvas);
    });
</script>

<div id="pixi-canvas-div">
</div>

<style lang="scss">
    @use "../../css/globals_forward.scss" as g;
    #pixi-canvas-div {
        $margin: (g.$spacing-l);
        $size: calc(100% - 2*$margin); 
        width: $size;
        max-width: $size;
        height: $size;
        max-height: $size;
        margin: $margin;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
    }
</style>