<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Marked } from 'marked';
  import { createNostrMarkdownExtensions } from '../../builders/markdown-nostr-extensions.js';
  import EmbeddedEvent from '../embedded-event.svelte';
  import { defaultContentRenderer, type ContentRenderer } from '../content-renderer';
  import { onMount, mount } from 'svelte';
  import { getContext, setContext } from 'svelte';
  import { CONTENT_RENDERER_CONTEXT_KEY } from '../content-renderer/content-renderer.context.js';

  // Component handlers are registered via ContentRenderer
  // No need to import them here as they're passed via the renderer prop

  interface Props {
    ndk?: NDKSvelte;
    content: string;
    emojiTags?: string[][];
    renderer?: ContentRenderer;
    class?: string;
  }

  let {
    ndk = getContext<NDKSvelte>('ndk'),
    content,
    emojiTags,
    renderer: providedRenderer,
    class: className = ''
  }: Props = $props();

  // Use renderer from prop, or from context, or fallback to default
  const rendererContext = getContext<any>(CONTENT_RENDERER_CONTEXT_KEY);
  const renderer = $derived(providedRenderer ?? rendererContext?.renderer ?? defaultContentRenderer);

  // Set renderer in context so nested components can access it
  setContext(CONTENT_RENDERER_CONTEXT_KEY, { get renderer() { return renderer } });

  let contentElement: HTMLDivElement;
  let mountedComponents: Array<{ target: Element; unmount: () => void }> = [];

  // Detect if content has markdown patterns
  const hasMarkdown = $derived.by(() => {
    const markdownPatterns = [
      /^#{1,6}\s/m,           // Headers
      /\*\*[^*]+\*\*/,        // Bold
      /\*[^*]+\*/,            // Italic
      /\[([^\]]+)\]\([^)]+\)/, // Links
      /!\[([^\]]*)\]\([^)]+\)/, // Images
      /^[-*+]\s/m,            // Unordered lists
      /^>\s/m,                // Blockquotes
      /```[\s\S]*?```/,       // Code blocks
      /^\d+\.\s/m,            // Ordered lists
    ];
    return markdownPatterns.some(pattern => pattern.test(content));
  });

  // Parse markdown with Nostr extensions
  const htmlContent = $derived.by(() => {
    if (hasMarkdown) {
      const nostrExtensions = createNostrMarkdownExtensions({
        emojiTags
      });

      const markedInstance = new Marked();
      markedInstance.use({ extensions: nostrExtensions });

      return markedInstance.parse(content) as string;
    }
    return content;
  });

  // Hydrate Nostr components after render
  function hydrateNostrComponents() {
    if (!contentElement) return;

    // Unmount any previously mounted components
    mountedComponents.forEach(({ unmount }) => unmount());
    mountedComponents = [];

    // Hydrate mentions
    const mentions = contentElement.querySelectorAll('.nostr-mention');
    mentions.forEach(placeholder => {
      const bech32 = placeholder.getAttribute('data-bech32');
      if (!bech32) return;

      if (renderer.mentionComponent) {
        const mounted = mount(renderer.mentionComponent, {
          target: placeholder,
          props: { ndk, bech32 }
        });
        mountedComponents.push({ target: placeholder, unmount: (mounted as any).unmount });
      } else {
        // No component registered - render raw bech32
        placeholder.textContent = `nostr:${bech32}`;
      }
    });

    // Hydrate event references (always use EmbeddedEvent)
    const eventRefs = contentElement.querySelectorAll('.nostr-event-ref');
    eventRefs.forEach(placeholder => {
      const bech32 = placeholder.getAttribute('data-bech32');
      if (!bech32) return;

      const mounted = mount(EmbeddedEvent, {
        target: placeholder,
        props: { ndk, bech32, renderer }
      });
      mountedComponents.push({ target: placeholder, unmount: (mounted as any).unmount });
    });

    // Hydrate hashtags
    const hashtags = contentElement.querySelectorAll('.nostr-hashtag');
    hashtags.forEach(placeholder => {
      const tag = placeholder.getAttribute('data-tag');
      if (!tag) return;

      if (renderer.hashtagComponent) {
        const mounted = mount(renderer.hashtagComponent, {
          target: placeholder,
          props: { ndk, tag }
        });
        mountedComponents.push({ target: placeholder, unmount: (mounted as any).unmount });
      } else {
        // No component registered - render raw hashtag
        placeholder.textContent = `#${tag}`;
      }
    });
  }

  // Hydrate after mount and when content changes
  onMount(() => {
    hydrateNostrComponents();

    return () => {
      mountedComponents.forEach(({ unmount }) => unmount());
    };
  });

  $effect(() => {
    // Re-hydrate when content changes
    htmlContent;
    if (contentElement) {
      hydrateNostrComponents();
    }
  });
</script>

<div
  bind:this={contentElement}
  class={className}
  data-markdown-event-content=""
>
  {@html htmlContent}
</div>

<style>
  [data-markdown-event-content] {
    line-height: 1.6;
    color: var(--foreground);
  }

  [data-markdown-event-content] :global(h1),
  [data-markdown-event-content] :global(h2),
  [data-markdown-event-content] :global(h3),
  [data-markdown-event-content] :global(h4),
  [data-markdown-event-content] :global(h5),
  [data-markdown-event-content] :global(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;
  }

  [data-markdown-event-content] :global(h1) { font-size: 2em; }
  [data-markdown-event-content] :global(h2) { font-size: 1.5em; }
  [data-markdown-event-content] :global(h3) { font-size: 1.25em; }
  [data-markdown-event-content] :global(h4) { font-size: 1em; }
  [data-markdown-event-content] :global(h5) { font-size: 0.875em; }
  [data-markdown-event-content] :global(h6) { font-size: 0.85em; }

  [data-markdown-event-content] :global(p) {
    margin-top: 0;
    margin-bottom: 1em;
  }

  [data-markdown-event-content] :global(a) {
    color: var(--primary);
    text-decoration: none;
  }

  [data-markdown-event-content] :global(a:hover) {
    text-decoration: underline;
  }

  [data-markdown-event-content] :global(ul),
  [data-markdown-event-content] :global(ol) {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 1em;
  }

  [data-markdown-event-content] :global(li) {
    margin-top: 0.25em;
  }

  [data-markdown-event-content] :global(code) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: var(--muted);
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  }

  [data-markdown-event-content] :global(pre) {
    padding: 1em;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: var(--muted);
    border-radius: 6px;
    margin-top: 0;
    margin-bottom: 1em;
  }

  [data-markdown-event-content] :global(pre code) {
    padding: 0;
    margin: 0;
    font-size: 100%;
    background-color: transparent;
    border: 0;
  }

  [data-markdown-event-content] :global(blockquote) {
    padding: 0 1em;
    color: var(--muted-foreground);
    border-left: 0.25em solid var(--border);
    margin-top: 0;
    margin-bottom: 1em;
  }

  [data-markdown-event-content] :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
  }

  [data-markdown-event-content] :global(.nostr-emoji) {
    height: 1.2em;
    width: auto;
    vertical-align: middle;
    display: inline-block;
  }
</style>
