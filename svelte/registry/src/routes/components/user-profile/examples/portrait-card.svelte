<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  // Example pubkeys for demonstration
  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'  // jb55
  ];
</script>

<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
  {#each examplePubkeys as pubkey}
    <UserProfile.Root {ndk} {pubkey}>
      <div class="flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl">
        <UserProfile.Avatar size={96} />
        <div class="flex flex-col items-center gap-1">
          <UserProfile.Name field="displayName" size="lg" />
          <UserProfile.Field field="name" size="sm" class="text-muted-foreground" />
        </div>
        <UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
        <div class="flex items-center gap-3 text-sm">
          <div class="flex flex-col items-center">
            <span class="font-semibold text-foreground">234</span>
            <span class="text-muted-foreground text-xs">notes</span>
          </div>
          <div class="text-muted-foreground">•</div>
          <div class="flex flex-col items-center">
            <span class="font-semibold text-foreground">1.5K</span>
            <span class="text-muted-foreground text-xs">followers</span>
          </div>
        </div>
        <UserProfile.Follow variant="primary" />
      </div>
    </UserProfile.Root>
  {/each}
</div>
