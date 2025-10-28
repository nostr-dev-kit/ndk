<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<div class="flex items-center gap-6 flex-wrap">
  {#each pubkeys.slice(0, 3) as pubkey}
    <UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
      <UserProfile.Avatar size={64} />
    </UserProfile.Root>
  {/each}
</div>
