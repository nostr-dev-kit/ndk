<script lang="ts">
  import { NDKArticle, NDKHighlight } from '@nostr-dev-kit/ndk';
  import ArticleEmbedded from '$lib/components/ndk/event/content/kinds/article-embedded/article-embedded.svelte';
  import NoteEmbedded from '$lib/components/ndk/event/content/kinds/note-embedded/note-embedded.svelte';
  import HighlightEmbedded from '$lib/components/ndk/event/content/kinds/highlight-embedded/highlight-embedded.svelte';

  // Step 1: Import NDK wrapper class and your new handler
  // import { NDKVideo } from '@nostr-dev-kit/ndk';
  // import VideoEmbedded from '$lib/components/ndk/event/content/kinds/video-embedded.svelte';

  // Step 2: Add to CLASS_HANDLERS array
  const CLASS_HANDLERS = [
    [NDKArticle, ArticleEmbedded],
    [NDKHighlight, HighlightEmbedded],
    [{ kinds: [1, 1111] }, NoteEmbedded],
    // [NDKVideo, VideoEmbedded],  // ← New handler added!
  ];

  // The system automatically:
  // - Extracts kind numbers from NDKVideo.kinds
  // - Wraps events using NDKVideo.from()
  // - Maps kinds to the VideoEmbedded component
</script>

<div class="p-4">
  <p class="text-sm text-muted-foreground">
    This example shows how to register a new kind handler using NDK wrapper classes.
    Just one line: add [WrapperClass, Component] to the array.
  </p>
</div>
