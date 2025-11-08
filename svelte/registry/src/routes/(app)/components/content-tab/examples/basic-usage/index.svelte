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
  import ContentTab from '$lib/registry/components/content-tab/content-tab.svelte';
  import { byCount } from '$lib/registry/builders/content-tab';

  interface Props {
    ndk: NDKSvelte;
    pubkeys?: string[];
    kinds?: number[];
  }

  let { ndk, pubkeys = ['hexpubkey'], kinds = [1, 30023, 1063] }: Props = $props();
</script>

<ContentTab {ndk} {pubkeys} {kinds} sort={byCount}>
  {#snippet tab({ kind, name, count })}
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
      role="tab"
    >
      <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
      <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
    </button>
  {/snippet}
</ContentTab>
