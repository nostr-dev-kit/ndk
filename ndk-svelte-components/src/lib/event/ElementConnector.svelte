<script lang="ts">
    export let from: HTMLElement;
    export let topOffset = 20;

    let bottomOfFrom: number = 0;
    let container: HTMLElement | undefined = undefined;

    let topOfContainer: number = 0;

    $: if (from) {
		bottomOfFrom = from.getBoundingClientRect().bottom;
	}

	$: if (container) {
		topOfContainer = container.getBoundingClientRect().top;
	}

    // when the window is resized, recalculate the positions
    window.addEventListener('resize', () => {
        if (from) {
            bottomOfFrom = from.getBoundingClientRect().bottom;
        }

        if (container) {
            topOfContainer = container.getBoundingClientRect().top;
        }
    });

	setInterval(() => {
		if (from) {
			bottomOfFrom = from.getBoundingClientRect().bottom;
		}

		if (container) {
			topOfContainer = container.getBoundingClientRect().top;
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