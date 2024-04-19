<script lang="ts">
    import Name from "$lib/user/Name.svelte";
    import type NDK from "@nostr-dev-kit/ndk";
    import { createEventDispatcher } from "svelte";

    export let ndk: NDK;
    export let value: { pubkey: string };

    const dispatch = createEventDispatcher();

    function clicked() {
        dispatch("click", { type: 'pubkey', pubkey: value.pubkey });
    }
</script>

<button on:click={clicked}>
    @<Name
        {ndk}
        npubMaxLength={12}
        pubkey={value.pubkey}
        attribute="name"
    />
</button>
