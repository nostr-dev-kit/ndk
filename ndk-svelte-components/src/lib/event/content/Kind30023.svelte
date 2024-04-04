<script lang="ts">
    import type { NDKArticle } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import NoteContentNewline from "./NoteContentNewline.svelte";
    import NoteContentTopic from "./NoteContentTopic.svelte";
    import NoteContentLink from "./NoteContentLink.svelte";

    import EventCard from "../EventCard.svelte";
    import NoteContentPerson from "./NoteContentPerson.svelte";
    import { LINK, HTML, NEWLINE, TOPIC, parseContent, groupContent, LINKCOLLECTION } from "../../utils/notes.js";
    import { markdownToHtml } from "$lib/utils/markdown";
    import type { SvelteComponent } from "svelte";

    export let ndk: NDK;
    export let article: NDKArticle;
    export let showMedia: boolean = true;
    export let anchorId: string | null = null;
    export let content = article.content;
    export let mediaCollectionComponent: typeof SvelteComponent | undefined = undefined;

    const htmlContent = markdownToHtml(content);
    const parsed = parseContent({ content: htmlContent, tags: article.tags, html: true });
    const groupedContent = groupContent(parsed);

    export const isNewline = (i: number) => !parsed[i] || parsed[i].type === NEWLINE;
    export const isStartOrEnd = (i: number) => isNewline(i - 1) || isNewline(i + 1);
</script>

<div class="article {$$props.class??""}">
    {#each groupedContent as { type, value }, i}
        {#if type === NEWLINE}
            <NoteContentNewline {value} />
        {:else if type === HTML}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html value}
        <!-- {:else if type === TOPIC}
            <NoteContentTopic {value} on:click /> -->
        {:else if type === LINK}
            <NoteContentLink {value} {showMedia} />
        {:else if type === LINKCOLLECTION}
            {#if mediaCollectionComponent}
                <svelte:component this={mediaCollectionComponent} links={value.map(v=>v.value.url)} />
            {:else}
                <div class="note-media--wrapper">
                    {#each value as {type: _type, value: _value}, j}
                        <NoteContentLink value={_value} {showMedia} />
                    {/each}
                </div>
            {/if}
        {:else if type.match(/^nostr:np(rofile|ub)$/)}
            <NoteContentPerson {ndk} {value} on:click />
        {:else if type.startsWith('nostr:') && showMedia && isStartOrEnd(i) && value.id !== anchorId}
            <EventCard {ndk} id={value.id} relays={value.relays} />
            <!-- <NoteContentEntity {value} /> -->
        {:else}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
