<script lang="ts">
    import type { NDKRelay } from '@nostr-dev-kit/ndk';
    import type NDK from '@nostr-dev-kit/ndk';
    import { onMount } from 'svelte';
    import RelayListItem from './RelayListItem.svelte';

    export let ndk: NDK;

    let relays: NDKRelay[] = [];
    let notices: Map<NDKRelay, string[]> = new Map();

    onMount(() => {
        update();
        ndk.pool.on('connect', () => {
            update();
        });
        ndk.pool.on('relay:connect', () => {
            update();
        });
        ndk.pool.on('disconnect', () => {
            update();
        });
    });

    function update() {
        relays = Array.from(ndk.pool.relays.values());
    }
</script>

<ul>
    {#each relays as relay}
        <RelayListItem {relay} />
    {/each}
</ul>
