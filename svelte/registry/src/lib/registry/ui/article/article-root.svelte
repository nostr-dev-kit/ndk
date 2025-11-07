<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './article.context.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;

    article: NDKArticle;

    onclick?: (e: MouseEvent) => void;

    class?: string;

    children: Snippet;
  }

  let {
    ndk: providedNdk,
    article,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get article() { return article; },
    get onclick() { return onclick; }
  };

  setContext(ARTICLE_CONTEXT_KEY, context);
</script>

<div class="article-root {className}">
  {@render children()}
</div>

<style>
  .article-root {
    display: contents;
  }
</style>
