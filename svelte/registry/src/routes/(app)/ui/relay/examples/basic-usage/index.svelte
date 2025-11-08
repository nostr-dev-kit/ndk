<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Relay } from '$lib/registry/ui/relay';

  const ndk = getContext<NDKSvelte>('ndk');
  const relayUrl = 'wss://relay.damus.io';
</script>

<Relay.Root {ndk} {relayUrl}>
  <div class="flex items-center gap-3">
    <Relay.Icon />
    <div>
      <Relay.Name />
      <Relay.Url />
    </div>
  </div>
</Relay.Root>

<style>
  .flex { display: flex; }
  .items-center { align-items: center; }
  .gap-3 { gap: 0.75rem; }
</style>
