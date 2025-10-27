<!--
  @component NotePreview - Twitter-style preview for text note events (kind 1)

  Shows:
  - Author with avatar
  - Note content (with truncation option)
  - Timestamp
  - Interaction counts (if available)
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Avatar from '$lib/ndk/user/avatar/avatar.svelte';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    author?: { name?: string; picture?: string } | null;
    onClick?: () => void;
    maxContentLength?: number;
  }

  let {
    ndk,
    event,
    author,
    onClick,
    maxContentLength = 280
  }: Props = $props();

  const authorName = $derived(
    author?.name || `${event.pubkey.slice(0, 8)}...`
  );

  const authorHandle = $derived(
    `@${event.pubkey.slice(0, 8)}`
  );

  // Format timestamp as relative time
  function formatRelativeTime(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const formattedTime = $derived(
    formatRelativeTime(event.created_at || 0)
  );

  // Get truncated content if needed
  const displayContent = $derived(() => {
    if (!maxContentLength || event.content.length <= maxContentLength) {
      return event.content;
    }
    return event.content.slice(0, maxContentLength) + '...';
  });

  // Count interactions (replies, reposts, reactions, zaps)
  const replyCount = $derived(0); // Would need to fetch from relays
  const repostCount = $derived(0); // Would need to fetch from relays
  const reactionCount = $derived(0); // Would need to fetch from relays
  const zapCount = $derived(0); // Would need to fetch from relays

  const showInteractions = $derived(
    replyCount > 0 || repostCount > 0 || reactionCount > 0 || zapCount > 0
  );
</script>

<article
  class="note-preview"
  onclick={onClick}
  role={onClick ? 'button' : undefined}
  tabindex={onClick ? 0 : undefined}
>
  <div class="note-avatar">
    <Avatar user={event.author} size={48} />
  </div>

  <div class="note-content">
    <div class="note-header">
      <div class="author-info">
        <span class="author-name">{authorName}</span>
        <span class="author-handle">{authorHandle}</span>
      </div>
      <span class="timestamp">{formattedTime}</span>
    </div>

    <div class="note-body">
      <EventContent
        {ndk}
        content={displayContent()}
        emojiTags={event.tags.filter(t => t[0] === 'emoji')}
      />
    </div>

    {#if showInteractions}
      <div class="note-interactions">
        {#if replyCount > 0}
          <button class="interaction-btn">
            <span class="interaction-icon">💬</span>
            <span class="interaction-count">{replyCount}</span>
          </button>
        {/if}
        {#if repostCount > 0}
          <button class="interaction-btn">
            <span class="interaction-icon">🔁</span>
            <span class="interaction-count">{repostCount}</span>
          </button>
        {/if}
        {#if reactionCount > 0}
          <button class="interaction-btn">
            <span class="interaction-icon">❤️</span>
            <span class="interaction-count">{reactionCount}</span>
          </button>
        {/if}
        {#if zapCount > 0}
          <button class="interaction-btn">
            <span class="interaction-icon">⚡</span>
            <span class="interaction-count">{zapCount}</span>
          </button>
        {/if}
      </div>
    {/if}
  </div>
</article>

<style>
  .note-preview {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--card-background, #ffffff);
    cursor: pointer;
    transition: all 0.2s;
    margin: 0.5rem 0;
  }

  .note-preview:hover {
    background: var(--card-hover-background, #f9fafb);
    border-color: var(--border-hover-color, #d1d5db);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .note-avatar {
    flex-shrink: 0;
  }

  .note-content {
    flex: 1;
    min-width: 0;
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
  }

  .author-name {
    font-weight: 700;
    color: var(--text-primary, #111827);
    font-size: 0.9375rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .author-handle {
    color: var(--text-muted, #6b7280);
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .timestamp {
    color: var(--text-muted, #6b7280);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .note-body {
    color: var(--text-primary, #111827);
    line-height: 1.5;
    word-wrap: break-word;
    font-size: 0.9375rem;
  }

  .note-interactions {
    display: flex;
    gap: 2rem;
    margin-top: 0.75rem;
  }

  .interaction-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-muted, #6b7280);
    font-size: 0.875rem;
    transition: color 0.2s;
  }

  .interaction-btn:hover {
    color: var(--text-primary, #111827);
  }

  .interaction-icon {
    font-size: 1rem;
  }

  .interaction-count {
    font-variant-numeric: tabular-nums;
  }
</style>