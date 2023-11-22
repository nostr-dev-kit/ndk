<script lang="ts">
    import { EventContent, Name } from '$lib';
    import EventCardDropdownMenu from './EventCardDropdownMenu.svelte';
    import Avatar from '$lib/user/Avatar.svelte';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import type NDK from '@nostr-dev-kit/ndk';
    import Time from "svelte-time";

    export let ndk: NDK;
    export let id: string | undefined = undefined;
    export const relays: string[] | undefined = undefined;
    export let event: NDKEvent | null | undefined = undefined;
    export let relativeTimeAllowed = true;

    // eslint-disable-next-line no-async-promise-executor
    const eventPromise = new Promise(async (resolve, reject) => {
        if (event) {
            resolve(event);
        } else if (id) {
            event = await ndk.fetchEvent(id);

            if (!event) reject('Event not found');
            else resolve(event);
        }
    });

    export let timeAgoCutoff: number = 60*60*24;

    function useRelativeTime() {
        if (!relativeTimeAllowed || !event) return false;

        const now = Date.now();
        const diff = now - event.created_at! * 1000;

        return diff < 1000 * timeAgoCutoff;
    }
</script>

{#await eventPromise then}
    <div class="event-card {$$props.class??""}">
        <div class="event-card--header">
            <div class="event-card--header--author">
                <Avatar
                    {ndk}
                    user={event?.author}
                    class="event-card--avatar"
                    style="width:40px; height:40px; object-fit:cover; border-radius: 100%; margin-right: 1rem;"
                />
                <Name {ndk} user={event?.author} class="event-card--name" />
            </div>

            <div class="event-card--header--time flex flex-row gap-2">
                {#if event}
                    <EventCardDropdownMenu {event} />
                {/if}
                <Time
                    relative={useRelativeTime()}
                    live={true}
                    timestamp={event?.created_at * 1000}
                />
            </div>
        </div>
        {#if !$$slots.default}
            <EventContent {ndk} {event} />
        {:else}
            <slot />
        {/if}
    </div>
{:catch error}
    <div class="event-card">
        <p class="event-card--error">{error}</p>
    </div>
{/await}

<style lang="postcss">
    .event-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: 1rem;
        border: 1px solid var(--color-border);
        background-color: var(--color-bg);
    }

    .event-card--header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-between;
        gap: 0.25rem;
        width: 100%;
        padding: 0;
    }

    .event-card--header--author {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.25rem;
        width: 100%;
        padding: 0;
    }

    .event-card--header--time {
        white-space: nowrap;
    }
</style>
