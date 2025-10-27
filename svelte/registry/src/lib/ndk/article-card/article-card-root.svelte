<!--
  @component ArticleCard.Root
  Root container that provides context for ArticleCard subcomponents.

  Fetches the article author's profile and shares it via context to all child components.

  @example
  ```svelte
  <ArticleCard.Root {ndk} {article}>
    <ArticleCard.Image />
    <ArticleCard.Title />
    <ArticleCard.Summary />
  </ArticleCard.Root>
  ```
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Article instance */
    article: NDKArticle;

    /** Whether clicking the card is interactive */
    interactive?: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children: Snippet;
  }

  let {
    ndk,
    article,
    interactive = true,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  // Fetch author profile (reactive to article changes)
  const authorProfile = $derived(
    article.author ? createProfileFetcher({ ndk, user: () => article.author! }) : null
  );

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get article() { return article; },
    get authorProfile() { return authorProfile; },
    get interactive() { return interactive; },
    get onclick() { return onclick; }
  };

  setContext(ARTICLE_CARD_CONTEXT_KEY, context);
</script>

<div class="article-card-root {className}">
  {@render children()}
</div>

<style>
  .article-card-root {
    display: contents;
  }
</style>
