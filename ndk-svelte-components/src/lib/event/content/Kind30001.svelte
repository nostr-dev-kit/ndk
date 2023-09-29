<script lang="ts">
    import type { NDKList } from "@nostr-dev-kit/ndk";
    import type NDK from '@nostr-dev-kit/ndk';
    import EventCard from "../EventCard.svelte";

    export let ndk:NDK;
    export let list: NDKList;
</script>

{#each list.items as tag (tag[1])}
    <div class='list-item {$$props.class??""}'>
        <EventCard {ndk} id={tag[1]} />
    </div>
{/each}

<style lang="postcss">
    .list-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.25rem;
        width: 100%;
        padding: 0;
        margin-bottom: 1rem;
    }
</style>