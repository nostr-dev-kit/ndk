<script lang="ts">
    import { NDKSubscriptionCacheUsage, type Hexpubkey, type NDKEvent, type NDKEventId } from "@nostr-dev-kit/ndk";
    import type { Readable } from 'svelte/store';
    import { fade } from 'svelte/transition';
    import { SvelteComponent, onDestroy } from "svelte";
    import EventCard from "./EventCard.svelte";
    import ElementConnector from "./ElementConnector.svelte";
    import type NDKSvelte from "@nostr-dev-kit/ndk-svelte";

    type ExtraItem = {
        component: typeof SvelteComponent;
        props: any;
    }
    type ExtraItemFetcher = (event: NDKEvent) => Readable<ExtraItem[]>;

    export let ndk: NDKSvelte;
    export let event: NDKEvent;
    export let skipEvent = false;
    export let eventComponent: any = EventCard;
    export let eventComponentProps: Object = {};
    export let whitelistPubkeys: Set<Hexpubkey> | undefined = undefined;
    export let useWhitelist = false;
    export let extraItemsFetcher: ExtraItemFetcher | undefined = undefined;

    // Event IDs that are part of the thread
    let threadIds = new Map<NDKEventId, NDKEvent>();
    let replyIds = new Map<NDKEventId, NDKEvent>();

    let eventsByAuthor = new Set<NDKEventId>([event.id]);

    threadIds.set(event.id, event);

    /**
     * Extra events are events that might be coming from alternative sources
     * instead of coming from a relay
     */
    let extraItems: Readable<ExtraItem[]>;

    if (extraItemsFetcher) {
        extraItems = extraItemsFetcher(event);
    }

    export let replies: Readable<NDKEvent[]> = ndk.storeSubscribe({
        kinds: [1, 12],
        "#e": Array.from(threadIds.keys())
    }, { closeOnEose: false, groupableDelay: 100, cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY });

    $: {
        const threadIdCountBefore = threadIds.size;
        const replyIdCountBefore = replyIds.size;

        // Update eventsByAuthor
        for (const taggedEvent of $replies) {
            if (taggedEvent.pubkey === event.pubkey)
                eventsByAuthor.add(taggedEvent.id);
        }

        // Find threaded events and replies
        for (const taggedEvent of $replies) {
            if (eventIsPartOfThread(taggedEvent))
                threadIds.set(taggedEvent.id, taggedEvent);
        }

        for (const taggedEvent of $replies) {
            if (threadIds.has(taggedEvent.id)) continue;
            if (eventIsReply(taggedEvent))
                replyIds.set(taggedEvent.id, taggedEvent);
        }

        // Do we need to redo our filter?
        if (threadIdCountBefore < threadIds.size) {
            replies.unsubscribe();
            replies = ndk.storeSubscribe({
                kinds: [1],
                "#e": Array.from(threadIds.keys())
            }, { closeOnEose: false, groupableDelay: 100, subId: "thread-filter" });
            threadIds = threadIds;
        }

        if (replyIdCountBefore < replyIds.size) {
            replyIds = replyIds;
        }
    }

    function eventIsPartOfThread(e: NDKEvent): boolean {
        // must be same author
        if (event.pubkey !== e.pubkey) return false;

        // Check if all tagged events are by the original author
        const taggedEventIds = e.getMatchingTags("e").map(tag => tag[1]);
        const allTaggedEventsAreByOriginalAuthor = taggedEventIds.every(id => eventsByAuthor.has(id));

        return allTaggedEventsAreByOriginalAuthor;
    }

    function eventIsReply(event: NDKEvent): boolean {
        return isReply(event);
    }

    onDestroy(() => {
        replies.unsubscribe();
    })

    function isReply(e: NDKEvent): boolean {
        const replyMarker = e.tags.find(tag => {
            return (
                threadIds.has(tag[1]) &&
                tag[3] === 'reply'
            );
        })

        if (replyMarker) return true;

        // check if the event has valid markers, if it does and we don't have an explicit reply, this was
        // probably a reply to a reply or a mention
        const hasMarker = !!e.tags.find(tag => ["reply", "mention"].includes(tag[3]));
        if (hasMarker) return false;

        // if we don't have markers, check if there are tags for other events that the main event
        // does not have
        const expectedTags = event.getMatchingTags("e").map(tag => tag[1]);
        expectedTags.push(event.id);

        // return true if there are no unexpected e tags
        return e.getMatchingTags("e").every(tag => expectedTags.includes(tag[1]));
    }

    function sortThread(a: NDKEvent, b: NDKEvent): number {
        return a.created_at! - b.created_at!;
    }

    function sortReplies(a: NDKEvent, b: NDKEvent): number {
        return a.created_at! - b.created_at!;
    }

    let eventContainer: HTMLElement;
</script>

<div class="event-thread flex flex-col gap-6" transition:fade={{ duration: 500 }}>
    {#if !skipEvent}
        <div class="event-wrapper w-full join-vertical join" bind:this={eventContainer}>
            {#each Array.from(threadIds.values()).sort(sortThread) as event (event.id)}
                <svelte:component
                    this={eventComponent}
                    {event}
                    ...eventComponentProps
                    class="{$$props.eventComponentClass??""} w-full join-item"
                />
            {/each}
        </div>
    {/if}

    {#if replyIds.size > 0 || $extraItems}
        <div class="event-thread--indent">
            {#each $extraItems??[] as item (item.props.key)}
                <ElementConnector
                    from={eventContainer}
                    topOffset={80}
                >
                    <svelte:component this={item.component}
                        {...item.props}
                    />
                </ElementConnector>
            {/each}

            {#each Array.from(replyIds.values()).sort(sortReplies) as reply (reply.id)}
                {#if !whitelistPubkeys || !useWhitelist || whitelistPubkeys.has(reply.pubkey)}
                    <ElementConnector
                        from={eventContainer}
                        topOffset={80}
                    >
                        <svelte:self
                            {ndk}
                            event={reply}
                            on:reply
                            skipEvent={false}
                            {eventComponent}
                            {eventComponentProps}
                            {whitelistPubkeys}
                            {useWhitelist}
                            {extraItemsFetcher}
                        />
                    </ElementConnector>
                {:else if whitelistPubkeys && useWhitelist && !whitelistPubkeys.has(reply.pubkey)}
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-row gap-2 items-center">
                            <span class="text-base-content flex-grow ui-common-font-light">This reply was hidden</span>
                            <button class="btn btn-sm bg-base-300 capitalize" on:click={() => useWhitelist = false}>Show anyway</button>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style lang="postcss">
    .event-thread--indent {
        padding-left: 30px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }

    /* :global(.event-content a) {
        @apply text-accent;
    }

    :global(.event-content span.name) {
        @apply text-white;
    }

    :global(.list-container) {
        @apply flex flex-col gap-32;
    } */
</style>