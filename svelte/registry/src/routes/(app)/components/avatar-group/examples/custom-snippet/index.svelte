<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, pubkeys } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { AvatarGroup } from '$lib/registry/components/avatar-group/index.js';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div>
    <p class="text-sm text-muted-foreground mb-2">Custom overflow indicator using snippet</p>
    <AvatarGroup {ndk} {pubkeys} max={4}>
      {#snippet overflowSnippet(count)}
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          +{count}
        </div>
      {/snippet}
    </AvatarGroup>
  </div>
</div>
