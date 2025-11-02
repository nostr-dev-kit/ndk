<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle, NDKHighlight } from '@nostr-dev-kit/ndk';
  import { ArticleContent } from '$lib/registry/components/article-content';
  import HighlightCardCompact from '$lib/registry/blocks/highlight-card-compact.svelte';
  import { Dialog } from 'bits-ui';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();

  const ndk = getContext<NDKSvelte>('ndk');

  let dialogOpen = $state(false);
  let selectedHighlight = $state<NDKHighlight | null>(null);

  function handleHighlightClick(highlight: NDKHighlight) {
    selectedHighlight = highlight;
    dialogOpen = true;
  }
</script>

<ArticleContent {ndk} {article} onHighlightClick={handleHighlightClick} />

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
    <Dialog.Content
      class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-border bg-card p-6 shadow-lg"
    >
      <Dialog.Title class="text-lg font-semibold mb-4">Highlight Details</Dialog.Title>

      {#if selectedHighlight}
        <HighlightCardCompact {ndk} event={selectedHighlight} />
      {/if}

      <Dialog.Close
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span class="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
