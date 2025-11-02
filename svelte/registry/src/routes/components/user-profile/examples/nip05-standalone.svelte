<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();

  const user = $derived(ndk.getUser({ pubkey }));
</script>

<!-- Standalone mode without User.Root -->
<User.Nip05 {ndk} {user} />
