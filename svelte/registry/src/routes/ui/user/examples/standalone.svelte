<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Use current user or a sample pubkey
  const userPubkey = ndk.$currentUser?.pubkey || 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
</script>

<!-- User.Avatar supports standalone mode without Root wrapper -->
<div class="flex items-center gap-3">
  <User.Avatar {ndk} user={userPubkey} size={40} class="rounded-full" />
  <div>
    <div class="font-medium">Standalone Avatar</div>
    <div class="text-sm text-gray-500">No Root wrapper needed</div>
  </div>
</div>

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
