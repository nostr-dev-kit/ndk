<script lang="ts">
    import { copyToClipboard } from "$lib/utils";
    import type { NDKEvent } from "@nostr-dev-kit/ndk";

    import { Copy, Link, MoreVertical } from "lucide-svelte";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let event: NDKEvent
    export let open = false;

    let copiedEventId = false;
    let copiedEventJSON = false;

    function copyId(e: Event) {
        e.stopPropagation();
        copyToClipboard(event.encode());
        copiedEventId = true;
        setTimeout(() => {
            copiedEventId = false;
        }, 1000);
    }

    function copyJSON(e: Event) {
        e.stopPropagation();
        copyToClipboard(JSON.stringify(event.rawEvent()));
        copiedEventJSON = true;
        setTimeout(() => {
            copiedEventJSON = false;
        }, 1000);
    }
</script>

<div class="event-card--dropdown-button {open ? "event-card--dropdown-button---opened" : "event-card--dropdown-button---closed"}">
    <button on:click={() => { open = !open}}>
        <MoreVertical size="16" />
    </button>

    {#if open}
        <ul class="event-card--dropdown-menu">
            <slot />
            <li>
                <button on:click={() => dispatch("open")} class="flex flex-row items-center gap-3">
                    <Link size="16" />
                    Open Link
                </button>
            </li>

            <li>
                <button class="flex flex-row items-center gap-3" on:click={copyId}>
                    <Copy size="16" />
                    <span class="whitespace-nowrap">{copiedEventId ? 'Copied!' : 'Copy ID'}</span>
                </button>
            </li>

            <li>
                <button class="flex flex-row items-center gap-3" on:click={copyJSON}>
                    <Copy size="16" />
                    <span class="whitespace-nowrap">{copiedEventJSON ? 'Copied!' : 'Copy Event JSON'}</span>
                </button>
            </li>
        </ul>
    {/if}
</div>

<style lang="postcss">
    .event-card--dropdown-button {
        position: relative;
    }

    ul {
        position: absolute;
        top: 10px;
    }
</style>