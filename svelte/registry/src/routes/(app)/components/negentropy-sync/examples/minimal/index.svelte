<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { syncBuilder } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createNegentropySync } from '$lib/registry/builders/negentropy-sync';
  import NegentropySyncProgressMinimal from '$lib/registry/components/negentropy-sync-minimal/negentropy-sync-progress-minimal.svelte';
  import type { NDKFilter } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  const syncBuilder = createNegentropySync(() => ({
    filters: [{ kinds: [1], limit: 500 }] as NDKFilter[],
    relayUrls: ['wss://relay.damus.io']
  }), ndk);
</script>

<NegentropySyncProgressMinimal {syncBuilder} />
