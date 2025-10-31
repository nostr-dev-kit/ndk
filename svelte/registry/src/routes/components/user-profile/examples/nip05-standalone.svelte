<script lang="ts">
  import { UserProfile } from '$lib/registry/components/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();

  const user = $derived(ndk.getUser({ pubkey }));
</script>

<!-- Standalone mode without UserProfile.Root -->
<UserProfile.Nip05 {ndk} {user} />
