<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserHeader } from '$lib/components/ndk/user-header/index.js';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();

  const user = $derived.by(() => ndk.getUser({ pubkey }));
</script>

<UserHeader.Centered {ndk} {user} />
