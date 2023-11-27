<script lang="ts">
    // import { without } from 'ramda';
    import {
        parseContent,
        // getLinks,
        truncateContent,
        LINK,
        // INVOICE,
        NEWLINE,
        TOPIC,

        LINKCOLLECTION,

        groupContent


    } from '../../utils/notes.js';
    // import MediaSet from "src/partials/MediaSet.svelte"
    // import QRCode from "src/partials/QRCode.svelte"
    import NoteContentNewline from './NoteContentNewline.svelte';
    import NoteContentTopic from './NoteContentTopic.svelte';
    import NoteContentLink from './NoteContentLink.svelte';
    import NoteContentPerson from './NoteContentPerson.svelte';
    import type NDK from '@nostr-dev-kit/ndk';
    import EventCard from '../EventCard.svelte';
    import { pluck, values, without } from 'ramda';
    import type { SvelteComponent } from 'svelte';
    // import NoteContentEntity from "./NoteContentEntity.svelte"

    export let event, maxLength;
    export let ndk: NDK;
    export let anchorId:string | null = null;
    export let showEntire = false;
    export let showMedia = true;
    export let content = event.content;
    export let mediaCollectionComponent: typeof SvelteComponent | undefined = undefined;

    export const getLinks = (parts: any[]) => pluck(
        "value",
        parts.filter(x => x.type === LINK && x.isMedia)
    )

    const fullContent = parseContent({ ...event, content });
    const shortContent = truncateContent(fullContent, { maxLength, showEntire, showMedia });
    const groupedContent = groupContent(shortContent);
    const links = getLinks(shortContent);
    const extraLinks = without(links, getLinks(fullContent));

    export const isNewline = (i: number) => !shortContent[i] || shortContent[i].type === NEWLINE;

    export const isStartOrEnd = (i: number) => isNewline(i - 1) || isNewline(i + 1);
</script>

<div class="event-content flex flex-col gap-2 overflow-hidden text-ellipsis {$$props.class??""}">
    <p>
        {#each groupedContent as { type, value }, i}
            {#if type === NEWLINE}
                <NoteContentNewline {value} />
            {:else if type === TOPIC}
                <NoteContentTopic {value} />
            {:else if type === LINK}
                <NoteContentLink {value} showMedia={showMedia && isStartOrEnd(i)} />
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
            {:else if type.startsWith('nostr:')}
                <!-- <NoteContentEntity {value} /> -->
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
