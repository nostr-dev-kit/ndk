<script lang="ts">
  import { UserProfile } from '$lib/registry/components/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey, size }: { ndk: NDKSvelte; pubkey: string; size: number } = $props();
</script>

<div class="flex items-center gap-4">
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Avatar {size} />
  </UserProfile.Root>
  <span class="text-sm text-muted-foreground">{size}px</span>
</div>
