<!-- @ndk-version: article-content-basic@0.1.0 -->
<script lang="ts">
  import { marked } from 'marked';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';

  interface Props {
    article: NDKArticle;
    class?: string;
  }

  let {
    article,
    class: className = ''
  }: Props = $props();

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
</script>

<div class="article-wrapper {className}">
  {#if hasMarkdown}
    <div
      role="article"
      tabindex="0"
      class="article-content prose prose-lg dark:prose-invert max-w-none"
    >
      {@html htmlContent}
    </div>
  {:else}
    <div
      role="article"
      tabindex="0"
      class="article-content text-lg leading-[1.8] whitespace-pre-wrap"
      style="font-family: var(--font-serif);"
    >
      {content}
    </div>
  {/if}
</div>

<style>
  @reference "../../../../app.css";

  .article-wrapper {
    position: relative;
  }

  .article-content {
    color: var(--foreground);
  }

  .article-content :global(h1) {
    @apply text-3xl sm:text-4xl font-bold mt-12 mb-6;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  .article-content :global(h2) {
    @apply text-2xl sm:text-3xl font-bold mt-10 mb-5;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  .article-content :global(h3) {
    @apply text-xl sm:text-2xl font-bold mt-8 mb-4;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  /* Remove top margin from first heading */
  .article-content > :global(h1:first-child),
  .article-content > :global(h2:first-child),
  .article-content > :global(h3:first-child),
  .article-content > :global(h4:first-child),
  .article-content > :global(h5:first-child),
  .article-content > :global(h6:first-child) {
    margin-top: 0;
  }

  .article-content :global(p) {
    @apply text-lg leading-[1.8] mb-6;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  .article-content :global(a) {
    @apply text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors;
  }

  .article-content :global(img) {
    @apply w-full rounded-lg shadow-sm my-8;
  }

  .article-content :global(ul) {
    @apply list-disc pl-6 mb-6 space-y-2 text-lg;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  .article-content :global(ol) {
    @apply list-decimal pl-6 mb-6 space-y-2 text-lg;
    font-family: var(--font-serif);
    color: var(--foreground);
  }

  .article-content :global(li) {
    @apply leading-[1.8];
  }

  .article-content :global(blockquote) {
    @apply border-l-4 pl-6 my-8 italic text-xl leading-[1.8];
    font-family: var(--font-serif);
    border-color: var(--border);
    color: var(--muted-foreground);
  }

  .article-content :global(code) {
    @apply px-1.5 py-0.5 rounded text-sm font-mono;
    background-color: var(--muted);
    color: var(--foreground);
  }

  .article-content :global(pre) {
    @apply mb-6 overflow-hidden rounded-lg;
  }

  .article-content :global(pre code) {
    @apply block border rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed;
    background-color: var(--background);
    border-color: var(--border);
  }

  .article-content :global(hr) {
    @apply my-12 border-t;
    border-color: var(--border);
  }

  .article-content :global(strong) {
    @apply font-bold;
    color: var(--foreground);
  }

  .article-content :global(em) {
    @apply italic;
  }
</style>
