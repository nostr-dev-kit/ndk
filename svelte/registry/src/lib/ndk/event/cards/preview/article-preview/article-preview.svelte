<!--
  @component ArticlePreview - Medium-style preview for article events (kind 30023)

  Shows:
  - Author with avatar
  - Title
  - Summary (max 2 lines)
  - Hero image (if available)
  - Reading time
  - Publication date
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Avatar from '$lib/ndk/user/avatar/avatar.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    author?: { name?: string; picture?: string } | null;
    onClick?: () => void;
  }

  let { ndk, event, author, onClick }: Props = $props();

  // Extract article metadata
  const title = $derived(event.tagValue('title') || 'Untitled Article');
  const summary = $derived(event.tagValue('summary') || event.content.slice(0, 200));
  const image = $derived(event.tagValue('image'));
  const publishedAt = $derived(event.tagValue('published_at') || event.created_at?.toString());

  // Calculate reading time (rough estimate: 200 words per minute)
  const readingTime = $derived(() => {
    const wordCount = event.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  });

  // Format date
  const formattedDate = $derived(() => {
    const timestamp = parseInt(publishedAt || '0');
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  const authorName = $derived(
    author?.name || `${event.pubkey.slice(0, 8)}...`
  );
</script>

<article
  class="article-preview"
  onclick={onClick}
  role={onClick ? 'button' : undefined}
  tabindex={onClick ? 0 : undefined}
>
  <div class="article-content">
    <div class="article-meta">
      <div class="author-info">
        <Avatar user={event.author} size={40} />
        <div class="author-details">
          <span class="author-name">{authorName}</span>
          <div class="article-stats">
            <span class="publish-date">{formattedDate}</span>
            {#if readingTime}
              <span class="separator">·</span>
              <span class="reading-time">{readingTime()}</span>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="article-body">
      <h2 class="article-title">{title}</h2>
      <p class="article-summary">{summary}</p>
    </div>
  </div>

  {#if image}
    <div class="article-image">
      <img src={image} alt={title} />
    </div>
  {/if}
</article>

<style>
  .article-preview {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--card-background, #ffffff);
    cursor: pointer;
    transition: all 0.2s;
    margin: 0.5rem 0;
  }

  .article-preview:hover {
    background: var(--card-hover-background, #f9fafb);
    border-color: var(--border-hover-color, #d1d5db);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .article-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .author-info {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .author-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .author-name {
    font-weight: 600;
    color: var(--text-primary, #111827);
    font-size: 0.875rem;
  }

  .article-stats {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
  }

  .separator {
    color: var(--text-muted, #9ca3af);
  }

  .article-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-summary {
    margin: 0;
    color: var(--text-secondary, #4b5563);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 0.875rem;
  }

  .article-image {
    flex-shrink: 0;
    width: 200px;
    height: 134px;
    border-radius: 0.375rem;
    overflow: hidden;
    background: var(--image-placeholder, #f3f4f6);
  }

  .article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 640px) {
    .article-preview {
      flex-direction: column-reverse;
    }

    .article-image {
      width: 100%;
      height: 200px;
    }
  }
</style>