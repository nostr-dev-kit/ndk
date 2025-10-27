<!--
  @component GenericPreview - Fallback preview for unknown or unhandled event kinds

  Shows:
  - Author with avatar
  - Event kind badge
  - Content preview (if available)
  - Timestamp
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
    kindLabel?: string;
  }

  let { ndk, event, author, onClick, kindLabel }: Props = $props();

  const authorName = $derived(
    author?.name || `${event.pubkey.slice(0, 8)}...`
  );

  const eventLabel = $derived(
    kindLabel || `Event (kind ${event.kind})`
  );

  // Format timestamp
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days}d ago`;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours > 0) return `${hours}h ago`;
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes > 0) return `${minutes}m ago`;
      return 'just now';
    }
  }

  const formattedTime = $derived(
    formatTime(event.created_at || 0)
  );

  // Get a preview of the content or tags
  const contentPreview = $derived(() => {
    // Try to get a meaningful preview based on event kind and content
    if (event.content) {
      return event.content.slice(0, 150) + (event.content.length > 150 ? '...' : '');
    }

    // For events without content, show relevant tags
    const relevantTags = event.tags
      .filter(tag => ['title', 'name', 'description', 'summary'].includes(tag[0]))
      .map(tag => `${tag[0]}: ${tag[1]}`)
      .slice(0, 2);

    if (relevantTags.length > 0) {
      return relevantTags.join('\n');
    }

    // Show tag count as fallback
    if (event.tags.length > 0) {
      return `${event.tags.length} tags`;
    }

    return 'No content';
  });
</script>

<article
  class="generic-preview"
  onclick={onClick}
  role={onClick ? 'button' : undefined}
  tabindex={onClick ? 0 : undefined}
>
  <div class="preview-header">
    <div class="author-section">
      <Avatar user={event.author} size={32} />
      <div class="author-info">
        <span class="author-name">{authorName}</span>
        <span class="event-kind">{eventLabel}</span>
      </div>
    </div>
    <span class="timestamp">{formattedTime}</span>
  </div>

  {#if contentPreview()}
    <div class="preview-content">
      <pre class="content-text">{contentPreview()}</pre>
    </div>
  {/if}
</article>

<style>
  .generic-preview {
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--card-background, #ffffff);
    cursor: pointer;
    transition: all 0.2s;
    margin: 0.5rem 0;
  }

  .generic-preview:hover {
    background: var(--card-hover-background, #f9fafb);
    border-color: var(--border-hover-color, #d1d5db);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .author-section {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .author-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .author-name {
    font-weight: 600;
    color: var(--text-primary, #111827);
    font-size: 0.875rem;
  }

  .event-kind {
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
    background: var(--badge-background, #f3f4f6);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    display: inline-block;
    width: fit-content;
  }

  .timestamp {
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
    white-space: nowrap;
  }

  .preview-content {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  .content-text {
    margin: 0;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--text-secondary, #4b5563);
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.4;
  }
</style>