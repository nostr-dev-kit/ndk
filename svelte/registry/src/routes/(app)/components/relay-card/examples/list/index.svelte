<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, relayUrl } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import RelayCardList from '$lib/registry/components/relay-card-list/relay-card-list.svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl?: string;
  }

  let { ndk, relayUrl = 'wss://relay.damus.io' }: Props = $props();
</script>

<RelayCardList {ndk} {relayUrl} />

<RelayCardList {ndk} {relayUrl} compact />
