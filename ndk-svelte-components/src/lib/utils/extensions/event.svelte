<script lang="ts">
    import EventCard from "$lib/event/EventCard.svelte";
    import type { NDKEvent } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import { getContext } from "svelte";

    const ndk = getContext('ndk') as NDK;
    export let id: string;

    let event: NDKEvent | null = null;

    ndk.fetchEvent(id).then((e) => {
        event = e;
    });
</script>

{#if event}
    <EventCard {ndk} {event} />
{/if}
