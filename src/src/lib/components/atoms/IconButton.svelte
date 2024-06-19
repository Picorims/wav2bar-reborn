<button type="button" class="icon-button">
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
        stroke: g.$color-primary;
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