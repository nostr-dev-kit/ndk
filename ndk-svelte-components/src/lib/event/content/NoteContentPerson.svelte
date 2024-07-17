<script lang="ts">
    import type { UrlFactory } from "$lib";
    import Name from "$lib/user/Name.svelte";
    import type NDK from "@nostr-dev-kit/ndk";
    import { createEventDispatcher } from "svelte";

    export let ndk: NDK;
    export let value: { pubkey: string };
    export let urlFactory: UrlFactory;

    const dispatch = createEventDispatcher();

    function clicked() {
        dispatch("click", { type: 'pubkey', pubkey: value.pubkey });
    }
</script>

<a class="mention" href={urlFactory("mention", value.pubkey)} on:click={clicked}>
    @<Name
        {ndk}
        npubMaxLength={12}
        pubkey={value.pubkey}
        attribute="name"
    />
</a>
