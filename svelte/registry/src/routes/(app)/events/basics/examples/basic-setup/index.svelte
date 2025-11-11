<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { children } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';

  // Import components to auto-register with defaultContentRenderer
  import '$lib/registry/components/mention';
  import '$lib/registry/components/hashtag';
  import '$lib/registry/components/link-inline-basic';
  import '$lib/registry/components/media-basic';

  import { CONTENT_RENDERER_CONTEXT_KEY, defaultContentRenderer } from '$lib/registry/ui/content-renderer';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Set the default renderer in context so all nested components can access it
  setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: defaultContentRenderer });
</script>

{@render children()}
