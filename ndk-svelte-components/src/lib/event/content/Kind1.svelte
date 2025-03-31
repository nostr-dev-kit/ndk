<script lang="ts">
import type { UrlFactory } from "$lib";
import type NDK from "@nostr-dev-kit/ndk";
import type { ComponentType } from "svelte";
// import { without } from 'ramda';
import {
    LINK,
    LINKCOLLECTION,
    // INVOICE,
    NEWLINE,
    TOPIC,
    groupContent,
    parseContent,
    truncateContent,
} from "../../utils/notes.js";
import EventCard from "../EventCard.svelte";
import NoteContentLink from "./NoteContentLink.svelte";
// import MediaSet from "src/partials/MediaSet.svelte"
// import QRCode from "src/partials/QRCode.svelte"
import NoteContentNewline from "./NoteContentNewline.svelte";
import NoteContentPerson from "./NoteContentPerson.svelte";
import NoteContentTopic from "./NoteContentTopic.svelte";
// import NoteContentEntity from "./NoteContentEntity.svelte"

export let event, maxLength;
export let ndk: NDK;
export const anchorId: string | null = null;
export const showEntire = false;
export const showMedia = true;
export const content = event.content;
export const mediaCollectionComponent: ComponentType | undefined = undefined;
export const eventCardComponent: ComponentType = EventCard;
export let urlFactory: UrlFactory;

const fullContent = parseContent({ ...event, content });
const shortContent = truncateContent(fullContent, { maxLength, showEntire, showMedia });
const _groupedContent = groupContent(shortContent);

export const isNewline = (i: number) => !shortContent[i] || shortContent[i].type === NEWLINE;

export const isStartOrEnd = (i: number) => isNewline(i - 1) || isNewline(i + 1);
</script>

<div class="event-content flex flex-col gap-2 overflow-hidden text-ellipsis {$$props.class??""}">
    <p>
        {#each groupedContent as { type, value }, i}
            {#if type === NEWLINE}
                <NoteContentNewline {value} />
            {:else if type === TOPIC}
                <NoteContentTopic {value} {urlFactory} />
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
                <NoteContentPerson {urlFactory} {ndk} {value} on:click />
            {:else if type.startsWith('nostr:') && showMedia && isStartOrEnd(i) && value.id !== anchorId}
                <svelte:component this={eventCardComponent} {ndk} id={value.id??value.entity} relays={value.relays} />
            {:else if type.startsWith('nostr:')}
                <svelte:component this={eventCardComponent} {ndk} id={value.id??value.entity} relays={value.relays} />
            {:else}
                {value}
            {/if}
            {' '}
        {/each}
    </p>
    <!-- {#if showMedia && extraLinks.length > 0}
        <MediaSet links={extraLinks} />
    {/if} -->
</div>
