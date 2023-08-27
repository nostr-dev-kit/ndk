<script lang="ts">
    import type { NDKArticle } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import NoteContentNewline from "./NoteContentNewline.svelte";
    import NoteContentTopic from "./NoteContentTopic.svelte";
    import NoteContentLink from "./NoteContentLink.svelte";

    import EventCard from "../EventCard.svelte";
    import NoteContentPerson from "./NoteContentPerson.svelte";
    import { LINK, HTML, NEWLINE, TOPIC, parseContent } from "../../utils/notes.js";
    import { markdownToHtml } from "$lib/utils/markdown";

    export let ndk: NDK;
    export let article: NDKArticle;
    export let showMedia: boolean = true;
    export let anchorId: string | null = null;

    const htmlContent = markdownToHtml(article.content);
    const parsed = parseContent({ content: htmlContent, tags: article.tags, html: true });
</script>

<div class="article">
    {#each parsed as { type, value }, i}
        {#if type === NEWLINE}
            <NoteContentNewline {value} />
        {:else if type === HTML}
            {@html value}
        {:else if type === TOPIC}
            <NoteContentTopic {value} />
        {:else if type === LINK}
            <NoteContentLink {value} {showMedia} />
        {:else if type.match(/^nostr:np(rofile|ub)$/)}
            <NoteContentPerson {ndk} {value} on:click />
        {:else if type.startsWith("nostr:") && showMedia && value.id !== anchorId}
            <EventCard {ndk} id={value.id} relays={value.relays} />
        {:else if type.startsWith("nostr:")}
            <!-- <NoteContentEntity {value} /> -->
        {:else}
            {@html value}
        {/if}
    {/each}
</div>

<style lang="postcss">
    * > :global(.article img) {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
</style>
