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

  // Import inline element handlers (auto-registers with priority)
  import '$lib/registry/components/mention-modern';
  import '$lib/registry/components/hashtag-modern';
  import '$lib/registry/components/link-embed';
  import '$lib/registry/components/media-carousel';

  // Import event kind handlers (auto-registers with priority)
  import '$lib/registry/components/note-card';
  import '$lib/registry/components/article-card';
  import '$lib/registry/components/highlight-card';

  import { CONTENT_RENDERER_CONTEXT_KEY, defaultContentRenderer } from '$lib/registry/ui/content-renderer';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Configure NSFW blocking (optional)
  defaultContentRenderer.blockNsfw = true;

  // Set the default renderer in context
  setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: defaultContentRenderer });
</script>

{@render children()}
