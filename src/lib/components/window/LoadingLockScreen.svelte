<script lang="ts">
    /*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors
    
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

    import { appState, setLoadingInfoDetail, setLoadingProgress } from "$lib/store/app_state.svelte";
	import { listen } from "@tauri-apps/api/event";
	import { LoaderCircle } from "lucide-svelte";
	import { onMount } from "svelte";

    interface Props {
        enabled: boolean;
    }

    let { enabled }: Props = $props();

	let stopListening = $state<() => void>(() => {
		console.warn("stopListening called before being set!");
	});

    async function listenForProgressMessage() {
		const unsubscribe = await listen<{message: string, progressPercent: number | null}>("set_loading_info_detail_progress", (event) => {
			const payload = event.payload;
			setLoadingInfoDetail(payload.message);
            setLoadingProgress(payload.progressPercent);
		});
		stopListening = unsubscribe;
	}

	onMount(() => {
		listenForProgressMessage();
		return stopListening;
	});

</script>

<div class="background" class:enabled>
    <div class="container">
        <LoaderCircle class="loader" size=48 />
        <span class="loading-info">{appState.loadingInfo}</span>
        <span class="loading-info">{appState.loadingInfoDetail}</span>
        {#if appState.loadingProgress !== null}
        <span class="loading-info progress">
            <progress max="100" value={appState.loadingProgress ?? 0}></progress>
            <span>{Math.floor(appState.loadingProgress ?? 0)}%</span>
        </span>
        {/if}
    </div>
</div>

<style lang="scss">
    @use '../../../lib/css/globals_forward.scss' as g;

    div.background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.75);

        display: flex;
        align-items: center;
        justify-content: center;

        visibility: hidden;
        &.enabled {
            visibility: visible;
        }

        :global(.loader) {
            animation: spin 1s linear infinite;
            color: g.$color-text;
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    }

    div.container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: g.$spacing-m;
    }

    span.loading-info {
        @include g.text;
        margin-top: g.$spacing-l;

        &.progress {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: g.$size-5xl;
            progress {
                width: 70%;
                border: 1px solid g.$color-primary-300;
            }
        }
    }
</style>