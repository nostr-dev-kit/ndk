<script lang="ts">
    import Name from '$lib/user/Name.svelte';
    import type NDK from '@nostr-dev-kit/ndk';
    import type { NDKUser } from '@nostr-dev-kit/ndk';
    import type NDKSvelte from '@nostr-dev-kit/ndk-svelte';
    import { getContext } from 'svelte';

    const ndk = getContext('ndk') as NDK;

    export let npub: string;
</script>

<button class="text-foreground underline">
    <Name {ndk} {npub} />
</button>