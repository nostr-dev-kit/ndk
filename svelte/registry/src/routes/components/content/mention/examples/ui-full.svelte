<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Mention } from '$lib/registry/components/event/content';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm">
    Custom styling: Hey <Mention {ndk} bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" class="font-bold text-blue-600 hover:text-blue-800" />, this mention has custom classes!
  </p>

  <p class="text-sm">
    Another style: Thanks <Mention {ndk} bech32="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" class="bg-yellow-100 px-2 py-1 rounded" /> for the contribution!
  </p>
</div>
