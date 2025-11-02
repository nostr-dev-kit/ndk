<!-- @ndk-version: article-content@0.3.0 -->
<script lang="ts">
  import { marked } from 'marked';
  import { NDKHighlight, NDKKind, type NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { getNDKFromContext } from '../../ui/ndk-context.svelte.js';
  import { User } from '../../ui/user';
  import HighlightToolbar from './highlight-toolbar.svelte';

  interface Props {
    ndk?: NDKSvelte;
    article: NDKArticle;
    highlightFilter?: (highlight: NDKHighlight) => boolean;
    onHighlightClick?: (highlight: NDKHighlight) => void;
    class?: string;
  }

  let {
    ndk: providedNdk,
    article,
    highlightFilter,
    onHighlightClick,
    class: className = ''
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  let contentElement = $state<HTMLDivElement>();
  let avatarData = $state<Array<{ pubkey: string; top: number; right: string }>>([]);

  // Text selection state
  let showHighlightToolbar = $state(false);
  let selectedText = $state('');
  let selectedRange = $state<Range | null>(null);

  // Subscribe to highlights for this article
  const highlightsSubscription = ndk.$subscribe<NDKHighlight>(() => {
    if (!article) return undefined;
    return {
      filters: {
        kinds: [NDKKind.Highlight],
        '#a': [article.tagId()]
      },
      subId: 'article-highlights',
      wrap: true
    };
  });

  const highlights = $derived.by(() => {
    const allHighlights = highlightsSubscription.events;
    if (!highlightFilter) return allHighlights;
    return allHighlights.filter(h => highlightFilter(h));
  });

  const content = $derived(article.content);

  const hasMarkdown = $derived.by(() => {
    const markdownPatterns = [
      /^#{1,6}\s/m,
      /\*\*[^*]+\*\*/,
      /\*[^*]+\*/,
      /\[([^\]]+)\]\([^)]+\)/,
      /^[-*+]\s/m,
      /^>\s/m,
      /```[\s\S]*?```/,
      /^\d+\.\s/m,
    ];
    return markdownPatterns.some(pattern => pattern.test(content));
  });

  const htmlContent = $derived.by(() => {
    if (hasMarkdown) {
      return marked.parse(content);
    }
    return content;
  });

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      showHighlightToolbar = false;
      return;
    }

    const text = selection.toString().trim();
    if (text.length === 0) {
      showHighlightToolbar = false;
      return;
    }

    // Check if selection is within the article content
    if (!contentElement?.contains(selection.anchorNode)) {
      showHighlightToolbar = false;
      return;
    }

    const range = selection.getRangeAt(0);

    selectedText = text;
    selectedRange = range;
    showHighlightToolbar = true;
  }

  function handleHighlightCreated() {
    showHighlightToolbar = false;
    selectedText = '';
    selectedRange = null;

    // Clear selection
    window.getSelection()?.removeAllRanges();
  }

  function handleCancelHighlight() {
    showHighlightToolbar = false;
    selectedText = '';
    selectedRange = null;
  }

  $effect(() => {
    if (contentElement && highlights.length > 0) {
      applyHighlights();
    }
  });

  // Recalculate avatar positions on resize
  $effect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (avatarData.length > 0) {
        addHighlightAvatars();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  function applyHighlights() {
    if (!contentElement) return;

    // Reset any existing highlights and avatars
    const existingMarks = contentElement.querySelectorAll('mark.nostr-highlight');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    // Remove existing avatar containers
    const existingAvatars = contentElement.querySelectorAll('.highlight-avatar-container');
    existingAvatars.forEach(avatar => avatar.remove());

    // Apply each highlight
    highlights.forEach(highlight => {
      const highlightText = highlight.content.trim();
      if (!highlightText || !contentElement) return;

      try {
        highlightTextInElement(contentElement, highlightText, NDKHighlight.from(highlight));
      } catch (err) {
        console.warn('Failed to apply highlight:', err);
      }
    });

    // Add avatars after all highlights are applied
    addHighlightAvatars();
  }

  function highlightTextInElement(element: HTMLElement, searchText: string, highlightEvent: NDKHighlight) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToHighlight: { node: Text; offset: number }[] = [];
    let currentNode: Text | null;

    while ((currentNode = walker.nextNode() as Text | null)) {
      // Skip if parent is already a highlight
      if (currentNode.parentElement?.classList.contains('nostr-highlight')) continue;

      const text = currentNode.textContent || '';
      const index = text.indexOf(searchText);

      if (index !== -1) {
        nodesToHighlight.push({ node: currentNode, offset: index });
      }
    }

    // Apply highlights (do this after tree walk to avoid modifying while walking)
    nodesToHighlight.forEach(({ node, offset }) => {
      const text = node.textContent || '';
      const before = text.substring(0, offset);
      const highlighted = text.substring(offset, offset + searchText.length);
      const after = text.substring(offset + searchText.length);

      const mark = document.createElement('mark');
      mark.className = 'nostr-highlight';
      mark.dataset.pubkey = highlightEvent.pubkey;
      mark.dataset.highlightId = highlightEvent.id;
      mark.textContent = highlighted;

      // Add click handler if callback is provided
      if (onHighlightClick) {
        mark.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          onHighlightClick(highlightEvent);
        });
      }

      const parent = node.parentNode;
      if (parent) {
        if (before) parent.insertBefore(document.createTextNode(before), node);
        parent.insertBefore(mark, node);
        if (after) parent.insertBefore(document.createTextNode(after), node);
        parent.removeChild(node);
      }
    });
  }

  function addHighlightAvatars() {
    if (!contentElement) return;

    const marks = contentElement.querySelectorAll('mark.nostr-highlight');
    const containerRect = contentElement.getBoundingClientRect();

    // Group marks by their containing block element
    const blockMap = new SvelteMap<HTMLElement, Set<string>>();

    marks.forEach(mark => {
      // Find the containing block element (p, h1, h2, etc.)
      let block = mark.parentElement;
      while (block && block !== contentElement) {
        const tagName = block.tagName.toLowerCase();
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'div'].includes(tagName)) {
          break;
        }
        block = block.parentElement;
      }

      if (block && block !== contentElement) {
        const pubkey = (mark as HTMLElement).dataset.pubkey;
        if (pubkey) {
          if (!blockMap.has(block)) {
            blockMap.set(block, new Set());
          }
          blockMap.get(block)?.add(pubkey);
        }
      }
    });

    // Prepare avatar data for rendering with calculated positions
    const newAvatarData: Array<{ pubkey: string; top: number; right: string }> = [];

    blockMap.forEach((pubkeys, block) => {
      const blockRect = block.getBoundingClientRect();
      const topPosition = blockRect.top - containerRect.top;

      // Add avatar data for each pubkey
      Array.from(pubkeys).forEach((pubkey, position) => {
        newAvatarData.push({
          pubkey,
          top: topPosition + (position * 40),
          right: '-3rem'
        });
      });
    });

    avatarData = newAvatarData;
  }
</script>

<div class="article-wrapper {className}">
  {#if hasMarkdown}
    <div
      bind:this={contentElement}
      onmouseup={handleMouseUp}
      role="article"
      tabindex="0"
      class="article-content prose prose-lg dark:prose-invert max-w-none select-text"
    >
      {@html htmlContent}
    </div>
  {:else}
    <div
      bind:this={contentElement}
      onmouseup={handleMouseUp}
      role="article"
      tabindex="0"
      class="article-content text-lg leading-[1.8] whitespace-pre-wrap select-text"
      style="font-family: var(--font-serif);"
    >
      {content}
    </div>
  {/if}

  <!-- Floating avatars for highlights -->
  {#each avatarData as { pubkey, top, right }, index (pubkey + index)}
    <div
      class="highlight-avatar"
      style="position: absolute; top: {top}px; right: {right};"
    >
      <User.Root {ndk} {pubkey}>
        <User.Avatar class="w-8 h-8 rounded-full ring-2 ring-background shadow-lg" />
      </User.Root>
    </div>
  {/each}
</div>

{#if showHighlightToolbar}
  <HighlightToolbar
    {ndk}
    {article}
    {selectedText}
    {selectedRange}
    onCreated={handleHighlightCreated}
    onCancel={handleCancelHighlight}
  />
{/if}

<style>
  @reference "../../../../app.css";

  .article-wrapper {
    position: relative;
  }

  .highlight-avatar {
    pointer-events: auto;
    z-index: 10;
  }

  .highlight-avatar:hover {
    transform: scale(1.1);
    transition: transform 0.2s;
  }

  :global(.article-content) {
    color: var(--color-foreground);
  }

  :global(.article-content h1) {
    @apply text-3xl sm:text-4xl font-bold mt-12 mb-6;
    font-family: var(--font-serif);
    color: var(--color-foreground);
  }

  :global(.article-content h2) {
    @apply text-2xl sm:text-3xl font-bold mt-10 mb-5;
    font-family: var(--font-serif);
    color: var(--color-foreground);
  }

  :global(.article-content h3) {
    @apply text-xl sm:text-2xl font-bold mt-8 mb-4;
    font-family: var(--font-serif);
    color: var(--color-foreground);
  }

  /* Remove top margin from first heading */
  :global(.article-content > h1:first-child),
  :global(.article-content > h2:first-child),
  :global(.article-content > h3:first-child),
  :global(.article-content > h4:first-child),
  :global(.article-content > h5:first-child),
  :global(.article-content > h6:first-child) {
    margin-top: 0;
  }

  :global(.article-content p) {
    @apply text-lg leading-[1.8] mb-6;
    font-family: var(--font-serif);
    color: var(--color-foreground);
  }

  :global(.article-content a) {
    @apply text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors;
  }

  :global(.article-content img) {
    @apply w-full rounded-lg shadow-sm my-8;
  }

  :global(.article-content ul) {
    @apply list-disc pl-6 mb-6 space-y-2 text-lg;
    font-family: var(--font-serif);
    color: var(--color-foreground);
  }

  :global(.article-content ol) {
    @apply list-decimal pl-6 mb-6 space-y-2 text-lg;
    font-family: var(--font-serif);
    color: var(--color-foreground);
  }

  :global(.article-content li) {
    @apply leading-[1.8];
  }

  :global(.article-content blockquote) {
    @apply border-l-4 pl-6 my-8 italic text-xl leading-[1.8];
    font-family: var(--font-serif);
    border-color: var(--color-border);
    color: var(--color-muted-foreground);
  }

  :global(.article-content code) {
    @apply px-1.5 py-0.5 rounded text-sm font-mono;
    background-color: var(--color-muted);
    color: var(--color-foreground);
  }

  :global(.article-content pre) {
    @apply mb-6 overflow-hidden rounded-lg;
  }

  :global(.article-content pre code) {
    @apply block border rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed;
    background-color: var(--color-background);
    border-color: var(--color-border);
  }

  :global(.article-content hr) {
    @apply my-12 border-t;
    border-color: var(--color-border);
  }

  :global(.article-content strong) {
    @apply font-bold;
    color: var(--color-foreground);
  }

  :global(.article-content em) {
    @apply italic;
  }

  /* Nostr highlight styles */
  :global(mark.nostr-highlight) {
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--color-primary) 60%, transparent);
    color: var(--color-foreground);
    @apply transition-all duration-200;
    @apply cursor-pointer;
    padding: 0.125rem 0;
    pointer-events: auto;
    user-select: none;
  }

  :global(mark.nostr-highlight:hover) {
    background-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    border-bottom-color: var(--color-primary);
  }
</style>
