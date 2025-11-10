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
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import UserCardCompact from '$lib/registry/components/user-card-compact/user-card-compact.svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  // Customize hover card globally
  MentionModern.hoverComponent = UserCardCompact;

  const sampleBech32 = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <p class="text-sm text-muted-foreground">
    Hover over this mention to see the compact user card: Thanks to <MentionModern {ndk} bech32={sampleBech32} /> for the work!
  </p>
</div>
