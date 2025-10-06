<script lang="ts">
  import { type NDKEvent } from '@nostr-dev-kit/ndk';
  import Avatar from '../../../../src/lib/components/Avatar.svelte';
  import EventContent from '../../../../src/lib/components/EventContent.svelte';

  interface Props {
    bookmark: NDKEvent;
    size?: 'small' | 'medium' | 'large';
  }

  let { bookmark, size = 'medium' }: Props = $props();

  const url = $derived(bookmark.tags.find((t) => t[0] === 'd')?.[1] || '');
  const title = $derived(bookmark.tags.find((t) => t[0] === 'title')?.[1] || url);
  const description = $derived(bookmark.content || '');
  const tags = $derived(bookmark.tags.filter((t) => t[0] === 't').map((t) => t[1]));
  const publishedAt = $derived(
    bookmark.tags.find((t) => t[0] === 'published_at')?.[1] || bookmark.created_at
  );

  const fullUrl = $derived(url.startsWith('http') ? url : `https://${url}`);
  const domain = $derived(
    (() => {
      try {
        return new URL(fullUrl).hostname.replace('www.', '');
      } catch {
        return url;
      }
    })()
  );

  const timeAgo = $derived(
    (() => {
      const now = Date.now() / 1000;
      const diff = now - Number(publishedAt);
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
      return `${Math.floor(diff / 604800)}w`;
    })()
  );

  // Get a color based on domain hash
  const cardColor = $derived(
    (() => {
      const colors = [
        'rgba(168, 85, 247, 0.15)',
        'rgba(59, 130, 246, 0.15)',
        'rgba(236, 72, 153, 0.15)',
        'rgba(34, 197, 94, 0.15)',
        'rgba(251, 146, 60, 0.15)',
      ];
      const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    })()
  );
</script>

<a href={fullUrl} target="_blank" rel="noopener noreferrer" class="card {size}">
  <div class="card-bg" style="background: {cardColor};"></div>

  <div class="card-header">
    <div class="author">
      <Avatar pubkey={bookmark.pubkey} size={24} />
      <span class="domain">{domain}</span>
    </div>
    <span class="time">{timeAgo}</span>
  </div>

  <div class="card-content">
    <h3 class="title">{title}</h3>
    {#if description}
      <div class="description">
        <EventContent content={description} emojiTags={bookmark.tags} event={bookmark} />
      </div>
    {/if}
  </div>

  {#if tags.length > 0}
    <div class="tags">
      {#each tags.slice(0, size === 'large' ? 5 : 3) as tag}
        <span class="tag">#{tag}</span>
      {/each}
    </div>
  {/if}

  <div class="card-shine"></div>
</a>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid var(--border);
    overflow: hidden;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    backdrop-filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
  }

  .card:hover {
    border-color: var(--accent-purple);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(168, 85, 247, 0.2);
  }

  .card-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .card:hover .card-shine {
    left: 100%;
  }

  .card.small {
    min-height: 160px;
  }

  .card.medium {
    min-height: 220px;
  }

  .card.large {
    min-height: 320px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .domain {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .large .title {
    font-size: 1.5rem;
    -webkit-line-clamp: 3;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .description :global(p) {
    margin: 0;
  }

  .large .description {
    -webkit-line-clamp: 4;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
    background: rgba(168, 85, 247, 0.2);
    color: var(--accent-purple);
    border-radius: 9999px;
    font-weight: 500;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }
</style>
