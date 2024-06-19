<script lang="ts">
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
        width: 600px;
        flex: 0 1 auto;
    }

    .title {
        @include g.heading-2;
        text-align: center;
    }
</style>