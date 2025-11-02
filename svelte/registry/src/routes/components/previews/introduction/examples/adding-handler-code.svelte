<script lang="ts">
  import { NDKArticle, NDKHighlight } from '@nostr-dev-kit/ndk';
  import { ArticleEmbedded } from '$lib/registry/components/article-embedded';
  import { NoteEmbedded } from '$lib/registry/components/note-embedded';
  import { HighlightEmbedded } from '$lib/registry/components/highlight-embedded';

  // Step 1: Import NDK wrapper class and your new handler
  // import { NDKVideo } from '@nostr-dev-kit/ndk';
  // import { VideoEmbedded } from '$lib/registry/components/video-embedded';

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
