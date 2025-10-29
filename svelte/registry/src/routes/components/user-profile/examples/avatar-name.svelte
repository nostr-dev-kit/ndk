<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={40} />
    <UserProfile.Name class="font-semibold" />
  </div>
</UserProfile.Root>
