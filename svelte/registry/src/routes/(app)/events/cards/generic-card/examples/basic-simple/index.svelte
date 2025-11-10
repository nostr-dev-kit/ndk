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
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { GenericEventBasic } from '$lib/registry/components/generic-event-basic';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  // Create a sample unknown event (kind 9999)
  const sampleEvent = new NDKEvent(ndk, {
    kind: 30023,
    content: 'This is a sample event of an unknown kind.',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['alt', 'A sample event demonstrating the generic fallback handler']
    ]
  } as any);
</script>

<GenericEventBasic {ndk} event={sampleEvent} />
