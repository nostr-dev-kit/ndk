<script lang="ts">
    import type NDK from "@nostr-dev-kit/ndk";
    import { NDKList, type NDKEvent } from "@nostr-dev-kit/ndk";
    import { NDKArticle } from "@nostr-dev-kit/ndk";
    import Kind1 from "./Kind1.svelte";
    // import Kind40 from "./Kind40.svelte"
    import Kind1063 from "./Kind1063.svelte";
    // import Kind1985 from "./Kind1985.svelte"
    import Kind9802 from "./Kind9802.svelte";
    import Kind30000 from "./Kind30000.svelte";
    import Kind30001 from "./Kind30001.svelte";
    import Kind30023 from "./Kind30023.svelte";

    export let ndk: NDK;
    export let event: NDKEvent;
    export let anchorId: string | null = null;
    export let maxLength: number = 700;
    export let showEntire: boolean = true;
    export let showMedia: boolean = true;
</script>

{#if event.kind === 1}
    <Kind1 {ndk} {event} {anchorId} {maxLength} {showEntire} {showMedia} on:click />
{:else if event.kind === 40}
    <!-- <Kind40 {event} /> -->
{:else if event.kind === 1063}
    <Kind1063 {event} {showMedia} />
{:else if event.kind === 1985}
    <!-- <Kind1985 {event} {anchorId} {maxLength} {showEntire} /> -->
{:else if event.kind === 9802}
    <Kind9802 {event} />
{:else if event.kind === 30000}
    <Kind30000 {ndk} list={NDKList.from(event)} />
{:else if event.kind === 30001}
    <Kind30001 {ndk} list={NDKList.from(event)} />
{:else if event.kind === 30023}
    <Kind30023 {ndk} article={NDKArticle.from(event)} {showMedia} on:click />
{:else}
    <Kind30023 {ndk} article={NDKArticle.from(event)} {anchorId} {showMedia} on:click />
{/if}
