<script lang="ts">
  import type { Component } from 'svelte';
  import ArticleEmbedded from '$lib/ndk/event/content/kinds/article-embedded.svelte';
  import NoteEmbedded from '$lib/ndk/event/content/kinds/note-embedded.svelte';
  import HighlightEmbedded from '$lib/ndk/event/content/kinds/highlight-embedded.svelte';

  // Step 1: Import your new handler
  import VideoEmbedded from '$lib/ndk/event/content/kinds/video-embedded.svelte';

  // Step 2: Add to KIND_HANDLERS map
  const KIND_HANDLERS: Record<number, Component<any>> = {
    30023: ArticleEmbedded,
    1: NoteEmbedded,
    1111: NoteEmbedded,
    9802: HighlightEmbedded,
    34235: VideoEmbedded,  // ← New handler added!
  };
</script>

<div class="p-4">
  <p class="text-sm text-muted-foreground">
    This example shows how to register a new kind handler.
    Just two lines: import the component, then add it to the map.
  </p>
</div>
