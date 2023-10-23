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
    import sanitizeHtml from 'sanitize-html'

    export let ndk: NDK;
    export let article: NDKArticle;
    export let showMedia: boolean = true;
    export let anchorId: string | null = null;
    export let content = article.content;

    const htmlContent = markdownToHtml(content);
    const parsed = parseContent({ content: htmlContent, tags: article.tags, html: true });
</script>

<div class="article {$$props.class??""}">
    {#each parsed as { type, value }}
        {#if type === NEWLINE}
            <NoteContentNewline {value} />
        {:else if type === HTML}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html sanitizeHtml(value)}
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
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html sanitizeHtml(value)}
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
