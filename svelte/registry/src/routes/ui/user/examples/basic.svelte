<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Use current user or a sample pubkey
  const userPubkey = ndk.$currentUser?.pubkey || 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
</script>

<User.Root {ndk} user={userPubkey}>
  <User.Avatar size={48} class="rounded-full" />
  <User.Name class="font-semibold" />
  <User.Handle class="text-sm text-gray-500" />
</User.Root>

<style>
  /* Add your custom styles */
</style>
