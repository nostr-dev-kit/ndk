<script lang="ts">
    import type { NDKArticle } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import NoteContentNewline from "./NoteContentNewline.svelte";
    import NoteContentTopic from "./NoteContentTopic.svelte";
    import NoteContentLink from "./NoteContentLink.svelte";

    import EventCard from "../EventCard.svelte";
    import NoteContentPerson from "./NoteContentPerson.svelte";
    import { LINK, HTML, NEWLINE, TOPIC, parseContent, LINKCOLLECTION } from "../../utils/notes.js";
    import { markdownToHtml } from "$lib/utils/markdown";
    import type { ComponentType } from "svelte";
    import RenderHtml from "./RenderHtml.svelte";
    import type sanitizeHtml from "sanitize-html";
    import type { MarkedExtension } from "marked";
    import type { UrlFactory } from "$lib";

    export let ndk: NDK;
    export let article: NDKArticle;
    export let showMedia: boolean = true;
    export let content = article.content;
    export let mediaCollectionComponent: ComponentType | undefined = undefined;
    export let sanitizeHtmlOptions: sanitizeHtml.IOptions | undefined = undefined;
    export let eventCardComponent: ComponentType = EventCard;
    export let markedExtensions: MarkedExtension[] = [];
    export let urlFactory: UrlFactory;

    const htmlContent = markdownToHtml(content, sanitizeHtmlOptions, markedExtensions);
    const parsed = parseContent({ content: htmlContent, tags: article.tags, html: true });

    export const isNewline = (i: number) => !parsed[i] || parsed[i].type === NEWLINE;
    export const isStartOrEnd = (i: number) => isNewline(i - 1) || isNewline(i + 1);
</script>

<div class="article {$$props.class??""}" on:click>
    {#each parsed as { type, value }, i}
        {#if type === NEWLINE}
            <NoteContentNewline {value} />
        {:else if type === HTML}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html value}
        {:else if type === TOPIC}
            <NoteContentTopic {value} {urlFactory} on:click />
        {:else if type === LINK}
            <NoteContentLink {value} {showMedia} on:click={() => alert(value)} />
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
        {:else if type.match(/^nostr:np(rofile|ub)$/) && value.pubkey}
            <NoteContentPerson {ndk} {value} {urlFactory} on:click />
        {:else if type.startsWith('nostr:')}
            <svelte:component this={eventCardComponent} {ndk} id={value.id??value.entity} relays={value.relays} />
        {:else}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <RenderHtml {ndk} content={value} on:click />
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
