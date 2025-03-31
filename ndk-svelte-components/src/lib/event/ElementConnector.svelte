<script lang="ts">
export let from: HTMLElement;
export const topOffset = 20;

let _bottomOfFrom = 0;
const container: HTMLElement | undefined = undefined;

let _topOfContainer = 0;

$: if (from) {
    _bottomOfFrom = from.getBoundingClientRect().bottom;
}

$: if (container) {
    _topOfContainer = container.getBoundingClientRect().top;
}

// when the window is resized, recalculate the positions
window.addEventListener("resize", () => {
    if (from) {
        _bottomOfFrom = from.getBoundingClientRect().bottom;
    }

    if (container) {
        _topOfContainer = container.getBoundingClientRect().top;
    }
});

setInterval(() => {
    if (from) {
        _bottomOfFrom = from.getBoundingClientRect().bottom;
    }

    if (container) {
        _topOfContainer = container.getBoundingClientRect().top;
    }
}, 2000);
</script>

<div
    class={$$props.class || ``}
    bind:this={container}
>
    <div class="
        connector
    " style="
        border-bottom-left-radius: 1rem;
        height: {topOfContainer - bottomOfFrom + topOffset}px;
        margin-top: -{topOfContainer - bottomOfFrom}px;
    "></div>
    <slot />
</div>

<style lang="postcss">
    .connector {
        margin-left: -20px;
        width: 20px;
        z-index: -1;
        position: absolute;

        border-left: var(--connector-width) var(--connector-style) var(--connector-color);
        border-bottom: var(--connector-width) var(--connector-style) var(--connector-color);
        margin-left: -20px !important;
    }
</style>