<script lang="ts">
  import { NDKHighlight, NDKKind, type NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { getContext, setContext } from 'svelte';
  import { getNDKFromContext } from '../../../../utils/ndk-context.svelte.js';
  import { defaultContentRenderer, type ContentRenderer } from '../../../../ui/content-renderer';
  import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from '../../../../ui/content-renderer/content-renderer.context.js';
  import { User } from '../../../../ui/user';
  import HighlightToolbar from './highlight-toolbar.svelte';
  import { MarkdownEventContent } from '../../../../ui/markdown-event-content';

  interface Props {
    ndk?: NDKSvelte;
    article: NDKArticle;
    renderer?: ContentRenderer;
    highlightFilter?: (highlight: NDKHighlight) => boolean;
    onHighlightClick?: (highlight: NDKHighlight) => void;
    class?: string;
  }

  let {
    ndk: providedNdk,
    article,
    renderer: providedRenderer,
    highlightFilter,
    onHighlightClick,
    class: className = ''
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Use renderer from prop, or from context, or fallback to default
  const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);
  const renderer = $derived(providedRenderer ?? rendererContext?.renderer ?? defaultContentRenderer);

  // Set renderer in context so nested components can access it
  setContext(CONTENT_RENDERER_CONTEXT_KEY, { get renderer() { return renderer } });

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

<div data-article-content="" class="article-wrapper {className}">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={contentElement}
    onmouseup={handleMouseUp}
    role="article"
    class="article-content select-text"
  >
    <MarkdownEventContent
      {ndk}
      content={article.content}
      emojiTags={article.tags}
      {renderer}
      class="prose prose-lg dark:prose-invert max-w-none"
    />
  </div>

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
  .article-wrapper {
    position: relative;
    max-width: calc(100% - 4rem);
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
    color: var(--foreground);
  }

  :global(.article-content h1) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    :global(.article-content h1) {
      font-size: 2.25rem;
    }
  }

  :global(.article-content h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 1.25rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    :global(.article-content h2) {
      font-size: 1.875rem;
    }
  }

  :global(.article-content h3) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    :global(.article-content h3) {
      font-size: 1.5rem;
    }
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
    font-size: 1.125rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content a) {
    color: rgb(37 99 235);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition-property: color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  :global(.article-content a:hover) {
    color: rgb(30 64 175);
  }

  @media (prefers-color-scheme: dark) {
    :global(.article-content a) {
      color: rgb(96 165 250);
    }

    :global(.article-content a:hover) {
      color: rgb(147 197 253);
    }
  }

  :global(.article-content img) {
    width: 100%;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  :global(.article-content ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content ul > * + *) {
    margin-top: 0.5rem;
  }

  :global(.article-content ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content ol > * + *) {
    margin-top: 0.5rem;
  }

  :global(.article-content li) {
    line-height: 1.8;
  }

  :global(.article-content blockquote) {
    border-left-width: 4px;
    padding-left: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    font-style: italic;
    font-size: 1.25rem;
    line-height: 1.8;
    font-family: var(--font-serif);
    border-color: var(--border);
    color: var(--muted-foreground);
  }

  :global(.article-content code) {
    padding-left: 0.375rem;
    padding-right: 0.375rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background-color: var(--muted);
    color: var(--foreground);
  }

  :global(.article-content pre) {
    margin-bottom: 1.5rem;
    overflow: hidden;
    border-radius: 0.5rem;
  }

  :global(.article-content pre code) {
    display: block;
    border-width: 1px;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.875rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1.625;
    background-color: var(--background);
    border-color: var(--border);
  }

  :global(.article-content hr) {
    margin-top: 3rem;
    margin-bottom: 3rem;
    border-top-width: 1px;
    border-color: var(--border);
  }

  :global(.article-content strong) {
    font-weight: 700;
    color: var(--foreground);
  }

  :global(.article-content em) {
    font-style: italic;
  }

  /* Nostr highlight styles */
  :global(.article-content mark.nostr-highlight) {
    background-color: color-mix(in srgb, var(--primary) 20%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--primary) 60%, transparent);
    color: var(--foreground);
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    cursor: pointer;
    padding: 0.125rem 0;
    pointer-events: auto;
    user-select: none;
  }

  :global(.article-content mark.nostr-highlight:hover) {
    background-color: color-mix(in srgb, var(--primary) 30%, transparent);
    border-bottom-color: var(--primary);
  }

  /* Nostr entity styles */
  :global(.article-content .nostr-emoji) {
    display: inline-block;
    height: 1.25em;
    width: auto;
    vertical-align: middle;
    margin: 0 0.1em;
  }

  :global(.article-content .nostr-mention),
  :global(.article-content .nostr-event-ref),
  :global(.article-content .nostr-hashtag) {
    display: inline;
  }
</style>
