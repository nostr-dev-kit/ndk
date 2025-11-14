<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './article.context.js';
  import { getNDK } from '../../utils/ndk';
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

  const ndk = getNDK(providedNdk);

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get article() { return article; },
    get onclick() { return onclick; }
  };

  setContext(ARTICLE_CONTEXT_KEY, context);
</script>

<div class="contents {className}">
  {@render children()}
</div>
