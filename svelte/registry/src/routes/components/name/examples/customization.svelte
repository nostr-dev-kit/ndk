<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey, size, truncate }: { ndk: NDKSvelte; pubkey: string; size: 'sm' | 'md' | 'lg' | 'xl'; truncate: boolean } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <div class="text-sm text-muted-foreground mb-2">Current size: {size}</div>
    <UserProfile.Root {ndk} {pubkey}>
      <UserProfile.Name field="displayName" {size} />
    </UserProfile.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-2">With truncation ({truncate ? 'enabled' : 'disabled'})</div>
    <div style="max-width: 200px;" class="border border-border rounded p-2">
      <UserProfile.Root {ndk} {pubkey}>
        <UserProfile.Name field="displayName" {truncate} />
      </UserProfile.Root>
    </div>
  </div>
</div>
