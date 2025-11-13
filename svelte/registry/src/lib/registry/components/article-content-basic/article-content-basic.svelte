<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext, setContext } from 'svelte';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import {
    defaultContentRenderer,
    ContentRenderer,
    type UserClickCallback,
    type EventClickCallback,
    type HashtagClickCallback,
    type LinkClickCallback,
    type MediaClickCallback
  } from '../../ui/content-renderer';
  import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from '../../ui/content-renderer/content-renderer.context.js';
  import { MarkdownEventContent } from '../../ui/markdown-event-content';

  interface Props {
    ndk?: NDKSvelte;
    article: NDKArticle;
    renderer?: ContentRenderer;
    onUserClick?: UserClickCallback;
    onEventClick?: EventClickCallback;
    onHashtagClick?: HashtagClickCallback;
    onLinkClick?: LinkClickCallback;
    onMediaClick?: MediaClickCallback;
    class?: string;
  }

  let {
    ndk: providedNdk,
    article,
    renderer: providedRenderer,
    onUserClick,
    onEventClick,
    onHashtagClick,
    onLinkClick,
    onMediaClick,
    class: className = ''
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Get parent context
  const parentContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

  // Use renderer from prop, or from context, or fallback to default
  const renderer = $derived.by(() => {
    const base = providedRenderer ?? parentContext?.renderer ?? defaultContentRenderer;

    // If custom callbacks are provided as props, create a new renderer with those callbacks
    if (onUserClick || onEventClick || onHashtagClick || onLinkClick || onMediaClick) {
      const customRenderer = new ContentRenderer();
      // Copy all properties from base renderer
      customRenderer.mentionComponent = base.mentionComponent;
      customRenderer.hashtagComponent = base.hashtagComponent;
      customRenderer.linkComponent = base.linkComponent;
      customRenderer.mediaComponent = base.mediaComponent;
      customRenderer.fallbackComponent = base.fallbackComponent;
      customRenderer.blockNsfw = base.blockNsfw;

      // Set custom callbacks or fall back to base renderer callbacks
      customRenderer.onUserClick = onUserClick ?? base.onUserClick;
      customRenderer.onEventClick = onEventClick ?? base.onEventClick;
      customRenderer.onHashtagClick = onHashtagClick ?? base.onHashtagClick;
      customRenderer.onLinkClick = onLinkClick ?? base.onLinkClick;
      customRenderer.onMediaClick = onMediaClick ?? base.onMediaClick;

      return customRenderer;
    }

    return base;
  });

  // Set ContentRendererContext for nested components
  setContext(CONTENT_RENDERER_CONTEXT_KEY, {
    get renderer() { return renderer; }
  });

</script>

<div data-article-content="" class="article-wrapper {className}">
  <div
    role="article"
    class="article-content-basic select-text"
  >
    <MarkdownEventContent
      {ndk}
      content={article.content}
      emojiTags={article.tags}
      {renderer}
      class="prose prose-lg dark:prose-invert max-w-none"
    />
  </div>
</div>

<style>
  .article-wrapper {
    position: relative;
    max-width: 100%;
  }

  :global(.article-content-basic) {
    color: var(--foreground);
  }

  :global(.article-content-basic h1) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    :global(.article-content-basic h1) {
      font-size: 2.25rem;
    }
  }

  :global(.article-content-basic h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 1.25rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    :global(.article-content-basic h2) {
      font-size: 1.875rem;
    }
  }

  :global(.article-content-basic h3) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    :global(.article-content-basic h3) {
      font-size: 1.5rem;
    }
  }

  /* Remove top margin from first heading */
  :global(.article-content-basic > h1:first-child),
  :global(.article-content-basic > h2:first-child),
  :global(.article-content-basic > h3:first-child),
  :global(.article-content-basic > h4:first-child),
  :global(.article-content-basic > h5:first-child),
  :global(.article-content-basic > h6:first-child) {
    margin-top: 0;
  }

  :global(.article-content-basic p) {
    font-size: 1.125rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content-basic a) {
    color: rgb(37 99 235);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition-property: color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  :global(.article-content-basic a:hover) {
    color: rgb(30 64 175);
  }

  @media (prefers-color-scheme: dark) {
    :global(.article-content-basic a) {
      color: rgb(96 165 250);
    }

    :global(.article-content-basic a:hover) {
      color: rgb(147 197 253);
    }
  }

  :global(.article-content-basic img:not([data-user-avatar--img])) {
    width: 100%;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  :global(.article-content-basic ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content-basic ul > * + *) {
    margin-top: 0.5rem;
  }

  :global(.article-content-basic ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content-basic ol > * + *) {
    margin-top: 0.5rem;
  }

  :global(.article-content-basic li) {
    line-height: 1.8;
  }

  :global(.article-content-basic blockquote) {
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

  :global(.article-content-basic code) {
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

  :global(.article-content-basic pre) {
    margin-bottom: 1.5rem;
    overflow: hidden;
    border-radius: 0.5rem;
  }

  :global(.article-content-basic pre code) {
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

  :global(.article-content-basic hr) {
    margin-top: 3rem;
    margin-bottom: 3rem;
    border-top-width: 1px;
    border-color: var(--border);
  }

  :global(.article-content-basic strong) {
    font-weight: 700;
    color: var(--foreground);
  }

  :global(.article-content-basic em) {
    font-style: italic;
  }

  /* Nostr entity styles */
  :global(.article-content-basic .nostr-emoji) {
    display: inline-block;
    height: 1.25em;
    width: auto;
    vertical-align: middle;
    margin: 0 0.1em;
  }

  :global(.article-content-basic .nostr-mention),
  :global(.article-content-basic .nostr-event-ref),
  :global(.article-content-basic .nostr-hashtag) {
    display: inline;
  }
</style>
