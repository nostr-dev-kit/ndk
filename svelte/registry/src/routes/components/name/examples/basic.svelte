<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey }: { ndk: NDKSvelte; pubkey: string } = $props();
</script>

<div class="flex flex-col gap-4">
  <div>
    <div class="text-sm text-muted-foreground mb-1">Display Name</div>
    <UserProfile.Root {ndk} {pubkey}>
      <UserProfile.Name field="displayName" />
    </UserProfile.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-1">Username</div>
    <UserProfile.Root {ndk} {pubkey}>
      <UserProfile.Name field="name" />
    </UserProfile.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-1">Both</div>
    <UserProfile.Root {ndk} {pubkey}>
      <UserProfile.Name field="both" />
    </UserProfile.Root>
  </div>
</div>
