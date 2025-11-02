<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Mention } from '$lib/registry/components/mention';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-muted-foreground">
    Inline mention in text: Hey <Mention {ndk} bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />, check this out!
  </p>

  <p class="text-sm text-muted-foreground">
    Another example: Thanks to <Mention {ndk} bech32="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" /> for the great work!
  </p>
</div>
