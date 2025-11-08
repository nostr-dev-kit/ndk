<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, pubkeys, kinds } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ContentTab from '$lib/registry/components/misc/content-tab/content-tab.svelte';
  import { byCount } from '$lib/registry/builders/content-tab';

  interface Props {
    ndk: NDKSvelte;
    pubkeys?: string[];
    kinds?: number[];
  }

  let { ndk, pubkeys = ['hexpubkey'], kinds = [1, 30023, 1063] }: Props = $props();
</script>

<ContentTab {ndk} {pubkeys} {kinds} sort={byCount} />
