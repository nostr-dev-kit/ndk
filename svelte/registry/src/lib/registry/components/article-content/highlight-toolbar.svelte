<script lang="ts">
  import { NDKHighlight, type NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
    selectedText: string;
    selectedRange: Range | null;
    onCreated: () => void;
    onCancel: () => void;
  }

  let { ndk, article, selectedText, selectedRange, onCreated, onCancel }: Props = $props();

  let isCreating = $state(false);
  let error = $state<string | null>(null);
  let toolbarEl = $state<HTMLDivElement>();
  let position = $state({ top: '0px', left: '0px', opacity: '0' });

  // Update position when toolbar is mounted or range changes
  $effect(() => {
    if (selectedRange && toolbarEl) {
      const rect = selectedRange.getBoundingClientRect();
      const toolbarRect = toolbarEl.getBoundingClientRect();

      // Position above the selection, centered
      const left = rect.left + rect.width / 2 - toolbarRect.width / 2;
      const top = rect.top - toolbarRect.height - 12; // 12px gap

      position = {
        top: `${top}px`,
        left: `${left}px`,
        opacity: '1'
      };
    }
  });

  async function createHighlight() {
    if (!ndk.$currentUser) {
      error = 'You must be logged in to create highlights';
      return;
    }

    if (!selectedText.trim()) {
      error = 'No text selected';
      return;
    }

    isCreating = true;
    error = null;

    try {
      const highlight = new NDKHighlight(ndk);
      highlight.content = selectedText.trim();
      highlight.article = article;

      await highlight.publish();
      onCreated();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create highlight';
      console.error('Failed to create highlight:', err);
      isCreating = false;
    }
  }
</script>

{#if selectedRange}
  <div
    data-highlight-toolbar=""
    bind:this={toolbarEl}
    class="bg-card fixed z-50 text-foreground rounded-lg shadow-xl border border-border overflow-hidden transition-opacity duration-150"
    style="top: {position.top}; left: {position.left}; opacity: {position.opacity};"
  >
    {#if error}
      <div class="px-4 py-2 bg-destructive/20 text-destructive text-sm border-b border-destructive/30">
        {error}
      </div>
    {/if}

    <div class="flex items-center">
      <button
        type="button"
        onclick={createHighlight}
        disabled={isCreating}
        class="flex items-center gap-2 px-4 py-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Create highlight"
      >
        {#if isCreating}
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" ></path>
          </svg>
        {:else}
          <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" ></path>
          </svg>
        {/if}
        <span class="text-sm font-medium">Highlight</span>
      </button>

      <div class="w-px h-6 bg-border"></div>

      <button
        type="button"
        onclick={onCancel}
        class="px-3 py-3 hover:bg-muted transition-colors"
        title="Cancel"
        disabled={isCreating}
      >
        <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" ></path>
        </svg>
      </button>
    </div>

    <!-- Arrow pointer -->
    {#if toolbarEl}
      <div
        class="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style="bottom: -6px;"
      >
        <div class="w-3 h-3 bg-card border-r border-b border-border rotate-45"></div>
      </div>
    {/if}
  </div>
{/if}
