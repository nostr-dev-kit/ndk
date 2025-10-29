<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserHeader } from '../index.js';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();

  const user = $derived.by(() => ndk.getUser({ pubkey }));
</script>

<UserHeader.Full {ndk} {user} />
