<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk }: { ndk: NDKSvelte } = $props();

  // Non-existent pubkeys for fallback demonstration
  const fallbackPubkeys = [
    'nonexistent1',
    'nonexistent2',
    'nonexistent3'
  ];
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-muted-foreground">When no profile picture is available, avatars show initials with a gradient background:</p>

  <div class="flex items-center gap-4">
    {#each fallbackPubkeys as pubkey}
      <UserProfile.Root {ndk} {pubkey}>
        <UserProfile.Avatar size={48} />
      </UserProfile.Root>
    {/each}
  </div>
</div>
