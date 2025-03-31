<script lang="ts">
import { copyToClipboard } from "$lib/utils";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

import { Copy, Link, MoreVertical, Trash } from "lucide-svelte";

import { createEventDispatcher } from "svelte";

const _dispatch = createEventDispatcher();

export let event: NDKEvent;
export const open = false;
export const enableDelete = false;

let _copiedEventId = false;
let _copiedEventJSON = false;

function copyId(e: Event) {
    e.stopPropagation();
    copyToClipboard(event.encode());
    _copiedEventId = true;
    setTimeout(() => {
        _copiedEventId = false;
    }, 1000);
}

function copyJSON(e: Event) {
    e.stopPropagation();
    copyToClipboard(JSON.stringify(event.rawEvent()));
    _copiedEventJSON = true;
    setTimeout(() => {
        _copiedEventJSON = false;
    }, 1000);
}
</script>

<div class="event-card--dropdown-button {open ? "event-card--dropdown-button---opened" : "event-card--dropdown-button---closed"} {$$props.class??""}">
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

            {#if enableDelete}
                <li>
                    <button class="flex flex-row items-center gap-3" on:click={() => dispatch("delete")}>
                        <Trash size="16" />
                        Delete
                    </button>
                </li>
            {/if}
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