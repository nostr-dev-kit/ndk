<script lang="ts">
    import { EventContent, Name } from '$lib';
    import Avatar from '$lib/user/Avatar.svelte';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import type NDK from '@nostr-dev-kit/ndk';

    export let ndk: NDK;
    export let id: string | undefined = undefined;
    export const relays: string[] | undefined = undefined;
    export let event: NDKEvent | null | undefined = undefined;

    const eventPromise = new Promise(async (resolve, reject) => {
        if (event) {
            resolve(event);
        } else if (id) {
            event = await ndk.fetchEvent(id);

            if (!event) reject('Event not found');
            else resolve(event);
        }
    });
</script>

{#await eventPromise then}
    <div class="event-card">
        <div class="event-card--header">
            <Avatar
                {ndk}
                user={event?.author}
                class="event-card--avatar"
                style="width:40px; height:40px; object-fit:cover; border-radius: 100%; margin-right: 1rem;"
            />
            <Name {ndk} user={event?.author} class="event-card--name" />
        </div>
        <EventContent {ndk} {event} />
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
        box-shadow: 0 0 0.5rem var(--color-shadow);
    }

    .event-card--header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.25rem;
        width: 100%;
        padding: 0;
    }
</style>
