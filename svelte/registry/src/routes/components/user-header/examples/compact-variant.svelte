<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserHeader } from '$lib/registry/components/user-header/index.js';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();

  const user = $derived(ndk.getUser({ pubkey }));
</script>

<UserHeader.Compact {ndk} {user} />
