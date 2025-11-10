<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, relay } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm">
    Hover over hashtags: Check out <HashtagModern {ndk} tag="nostr" /> and <HashtagModern {ndk} tag="bitcoin" /> for great content!
  </p>

  <p class="text-sm text-muted-foreground">
    Explore trending: <HashtagModern {ndk} tag="grownostr" /> and <HashtagModern {ndk} tag="plebchain" />
  </p>
</div>
