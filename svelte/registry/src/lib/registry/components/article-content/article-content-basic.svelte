<!-- @ndk-version: article-content-basic@0.1.0 -->
<script lang="ts">
  import { Marked } from 'marked';
  import { mount } from 'svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import { createNostrMarkdownExtensions } from '../../builders/markdown-nostr-extensions.js';
  import { defaultContentRenderer } from '../../ui/content-renderer.svelte.js';
  import Mention from '../mention/mention.svelte';
  import EmbeddedEvent from '../../ui/embedded-event.svelte';

  interface Props {
    article: NDKArticle;
    ndk?: NDKSvelte;
    class?: string;
  }

  let {
    article,
    ndk: providedNdk,
    class: className = ''
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);
  const renderer = defaultContentRenderer;

  let contentElement = $state<HTMLDivElement>();
  let mountedComponents: Array<{ target: HTMLElement; unmount: () => void }> = [];

  const htmlContent = $derived.by(() => {
    const extensions = createNostrMarkdownExtensions({
      emojiTags: article.tags
    });

    const markedInstance = new Marked({ extensions });
    return markedInstance.parse(article.content) as string;
  });

  function hydrateNostrComponents() {
    if (!contentElement) return;

    // Clean up previously mounted components
    mountedComponents.forEach(({ unmount }) => unmount());
    mountedComponents = [];

    // Hydrate mentions (npub, nprofile)
    const mentions = contentElement.querySelectorAll<HTMLElement>('.nostr-mention');
    mentions.forEach(placeholder => {
      const bech32 = placeholder.dataset.bech32;
      if (!bech32) return;

      const MentionComponent = renderer.mentionComponent || Mention;
      const mounted = mount(MentionComponent, {
        target: placeholder,
        props: { ndk, bech32 }
      });

      mountedComponents.push({ target: placeholder, unmount: mounted.unmount });
    });

    // Hydrate event references (note, nevent, naddr)
    const eventRefs = contentElement.querySelectorAll<HTMLElement>('.nostr-event-ref');
    eventRefs.forEach(placeholder => {
      const bech32 = placeholder.dataset.bech32;
      if (!bech32) return;

      const mounted = mount(EmbeddedEvent, {
        target: placeholder,
        props: { ndk, bech32, renderer, variant: 'inline' }
      });

      mountedComponents.push({ target: placeholder, unmount: mounted.unmount });
    });

    // Hydrate hashtags
    const hashtags = contentElement.querySelectorAll<HTMLElement>('.nostr-hashtag');
    hashtags.forEach(placeholder => {
      const tag = placeholder.dataset.tag;
      if (!tag) return;

      if (renderer.hashtagComponent) {
        const mounted = mount(renderer.hashtagComponent, {
          target: placeholder,
          props: { tag }
        });
        mountedComponents.push({ target: placeholder, unmount: mounted.unmount });
      } else {
        // Default rendering
        placeholder.textContent = `#${tag}`;
      }
    });
  }

  // Hydrate components after content is rendered
  $effect(() => {
    if (contentElement) {
      hydrateNostrComponents();
    }
  });

  // Cleanup on unmount
  $effect(() => {
    return () => {
      mountedComponents.forEach(({ unmount }) => unmount());
    };
  });
</script>

<div data-article-content-basic="" class="article-wrapper {className}">
  <div
    bind:this={contentElement}
    role="article"
    tabindex="0"
    class="article-content prose prose-lg dark:prose-invert max-w-none text-xs break-all"
  >
    {@html htmlContent}
  </div>
</div>

<style>
  @reference "../../../../app.css";

  .article-wrapper {
    position: relative;
  }

  :global(.article-content) {
    color: var(--foreground);
  }

  :global(.article-content h1) {
    @apply text-3xl sm:text-4xl font-bold mt-12 mb-6;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content h2) {
    @apply text-2xl sm:text-3xl font-bold mt-10 mb-5;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content h3) {
    @apply text-xl sm:text-2xl font-bold mt-8 mb-4;
    font-family: var(--font-serif);
    color: var(--foreground);
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
    color: var(--foreground);
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
    color: var(--foreground);
  }

  :global(.article-content ol) {
    @apply list-decimal pl-6 mb-6 space-y-2 text-lg;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  :global(.article-content li) {
    @apply leading-[1.8];
  }

  :global(.article-content blockquote) {
    @apply border-l-4 pl-6 my-8 italic text-xl leading-[1.8];
    font-family: var(--font-serif);
    border-color: var(--border);
    color: var(--muted-foreground);
  }

  :global(.article-content code) {
    @apply px-1.5 py-0.5 rounded text-sm font-mono;
    background-color: var(--muted);
    color: var(--foreground);
  }

  :global(.article-content pre) {
    @apply mb-6 overflow-hidden rounded-lg;
  }

  :global(.article-content pre code) {
    @apply block border rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed;
    background-color: var(--background);
    border-color: var(--border);
  }

  :global(.article-content hr) {
    @apply my-12 border-t;
    border-color: var(--border);
  }

  :global(.article-content strong) {
    @apply font-bold;
    color: var(--foreground);
  }

  :global(.article-content em) {
    @apply italic;
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
