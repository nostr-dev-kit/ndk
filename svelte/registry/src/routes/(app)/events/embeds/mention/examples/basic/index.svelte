<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Mention } from '$lib/registry/components/mention';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <p class="text-sm text-muted-foreground">
    Hey <Mention {ndk} bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />, check this out!
  </p>

  <p class="text-sm text-muted-foreground">
    Thanks to <Mention {ndk} bech32="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" /> for the help.
  </p>
</div>
