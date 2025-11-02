<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Use current user or a sample pubkey
  const userPubkey = ndk.$currentUser?.pubkey || 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
</script>

<!-- User.Avatar with minimal Root wrapper for standalone usage -->
<User.Root {ndk} pubkey={userPubkey}>
  <div class="flex items-center gap-3">
    <User.Avatar size={40} class="rounded-full" />
    <div>
      <div class="font-medium">Avatar with Root</div>
      <div class="text-sm text-gray-500">Minimal wrapper for context</div>
    </div>
  </div>
</User.Root>

<style>
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .gap-3 {
    gap: 0.75rem;
  }
  .font-medium {
    font-weight: 500;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-gray-500 {
    color: #6b7280;
  }
</style>
