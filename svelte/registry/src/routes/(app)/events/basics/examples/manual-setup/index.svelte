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

  // Import components (don't rely on auto-registration)
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';
  import LinkInlineBasic from '$lib/registry/components/link-inline-basic/link-inline-basic.svelte';
  import MediaCarousel from '$lib/registry/components/media-carousel/media-carousel.svelte';
  import EventCardBasic from '$lib/registry/components/event-card-basic/event-card-basic.svelte';

  import { ContentRenderer, CONTENT_RENDERER_CONTEXT_KEY } from '$lib/registry/ui/content-renderer';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Create a custom renderer instance
  const customRenderer = $derived.by(() => {
    const renderer = new ContentRenderer();

    // Manually register inline element handlers
    renderer.setMentionComponent(MentionModern, 1);
    renderer.setHashtagComponent(HashtagModern, 1);
    renderer.setLinkComponent(LinkInlineBasic, 1);
    renderer.setMediaComponent(MediaCarousel, 1);

    // Manually register event kind handlers
    renderer.addKind([1, 1111], EventCardBasic, 10);

    // Configure options
    renderer.blockNsfw = false;

    return renderer;
  });

  // Set the custom renderer in context
  setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: customRenderer });
</script>

{@render children()}
