<!-- @ndk-version: article-card@0.13.0 -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { getNDKFromContext } from '../ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

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
    ndk: providedNdk,
    article,
    interactive = true,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get article() { return article; },
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
