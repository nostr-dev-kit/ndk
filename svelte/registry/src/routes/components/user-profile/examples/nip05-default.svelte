<script lang="ts">
  import { UserProfile } from '$lib/components/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<UserProfile.Root {ndk} {pubkey}>
  <UserProfile.Nip05 />
</UserProfile.Root>
