<!--
  @component EmbeddedEvent - Renders a referenced Nostr event with appropriate styling based on its kind

  Handles different event kinds with tailored displays:
  - Text notes (kind 1, 1111)
  - Articles (kind 30023)
  - Reposts (kind 6, 16)
  - Reactions (kind 7)
  - Images/Videos (kind 20, 21, 22, 34235, 34236)
  - And more...

  @example
  ```svelte
  <EmbeddedEvent
    {ndk}
    bech32="note1..."
    onEventClick={(event) => goto(`/e/${event.id}`)}
  />
  ```
-->
<script lang="ts">
  import type { NDKEvent, NDKSvelte, NDKKind } from '@nostr-dev-kit/ndk';
  import Avatar from './Avatar.svelte';
  import EventContent from './EventContent.svelte';

  interface Props {
    /** NDKSvelte instance for fetching event data */
    ndk: NDKSvelte;
    /** The bech32 string to fetch (note1, nevent1, naddr1) - preferred for external use */
    bech32?: string;
    /** The event to render (if already fetched) */
    event?: NDKEvent;
    /** Additional CSS classes */
    class?: string;
    /** Callback when the embedded event is clicked */
    onEventClick?: (event: NDKEvent) => void;
    /** Whether to show a compact version */
    compact?: boolean;
    /** Maximum content length before truncation (0 = no truncation) */
    maxContentLength?: number;
    /** @internal Hex event ID for internal use (e.g., reposts) */
    eventId?: string;
  }

  let {
    ndk,
    bech32,
    eventId,
    event: providedEvent,
    class: className = '',
    onEventClick,
    compact = false,
    maxContentLength = 500,
  }: Props = $props();

  let fetchedEvent = $state<NDKEvent | null>(providedEvent || null);
  let author = $state<{ name?: string; picture?: string } | null>(null);
  let loading = $state(!providedEvent);
  let error = $state<string | null>(null);

  // Fetch event if bech32 or eventId is provided
  $effect(() => {
    const identifier = bech32 || eventId; // Prioritize bech32

    if (!providedEvent && identifier && ndk) {
      loading = true;
      error = null;

      ndk.fetchEvent(identifier)
        .then((event) => {
          if (event) {
            fetchedEvent = event;
            // Fetch author profile
            const user = ndk.getUser({ pubkey: event.pubkey });
            if (!user.profile) {
              user.fetchProfile().then(() => {
                author = user.profile || null;
              });
            } else {
              author = user.profile;
            }
          } else {
            error = 'Event not found';
          }
        })
        .catch((err) => {
          console.error('Failed to fetch event:', err);
          error = 'Failed to load event';
        })
        .finally(() => {
          loading = false;
        });
    } else if (providedEvent) {
      fetchedEvent = providedEvent;
      loading = false;

      // Fetch author profile for provided event
      const user = ndk.getUser({ pubkey: providedEvent.pubkey });
      if (!user.profile) {
        user.fetchProfile().then(() => {
          author = user.profile || null;
        });
      } else {
        author = user.profile;
      }
    }
  });

  // Get event kind label
  function getEventKindLabel(kind: number): string {
    switch (kind) {
      case 0: return 'Profile';
      case 1: return 'Note';
      case 3: return 'Contact List';
      case 4: return 'Encrypted Message';
      case 5: return 'Event Deletion';
      case 6: return 'Repost';
      case 7: return 'Reaction';
      case 8: return 'Badge Award';
      case 16: return 'Generic Repost';
      case 20: return 'Image';
      case 21: return 'Video';
      case 22: return 'Short Video';
      case 23: return 'Story';
      case 30023: return 'Article';
      case 34235: return 'Horizontal Video';
      case 34236: return 'Vertical Video';
      case 1063: return 'Media';
      case 1111: return 'Reply';
      case 9734: return 'Zap Request';
      case 9735: return 'Zap';
      case 30402: return 'Classified';
      case 30818: return 'Wiki';
      default: return `Event (kind ${kind})`;
    }
  }

  // Get truncated content if needed
  function getTruncatedContent(content: string): string {
    if (maxContentLength === 0 || content.length <= maxContentLength) {
      return content;
    }
    return content.slice(0, maxContentLength) + '...';
  }

  // Handle click
  function handleClick() {
    if (onEventClick && fetchedEvent) {
      onEventClick(fetchedEvent);
    }
  }

  // Format timestamp
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'just now';
    }
  }

  // Determine if this is a media event
  const isMediaEvent = $derived(
    fetchedEvent && [20, 21, 22, 34235, 34236, 1063].includes(fetchedEvent.kind)
  );

  // Determine if this is a reaction
  const isReaction = $derived(fetchedEvent && fetchedEvent.kind === 7);

  // Get reaction content
  const reactionContent = $derived.by(() => {
    if (!isReaction || !fetchedEvent) return { type: 'text', content: '' };

    // Check for custom emoji reaction
    const emojiTag = fetchedEvent.tags.find(t => t[0] === 'emoji');
    if (emojiTag && emojiTag[2]) {
      return { type: 'emoji', url: emojiTag[2], name: emojiTag[1] };
    }

    // Regular reaction content (emoji or +/-)
    return { type: 'text', content: fetchedEvent.content || '👍' };
  });
</script>

<div
  class="embedded-event {className} {compact ? 'compact' : ''} {isReaction ? 'reaction' : ''}"
  onclick={handleClick}
  role={onEventClick ? 'button' : undefined}
  tabindex={onEventClick ? 0 : undefined}
>
  {#if loading}
    <div class="loading">Loading event...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if fetchedEvent}
    {#if isReaction}
      <!-- Reaction display -->
      {@const reaction = reactionContent}
      <div class="reaction-content">
        {#if reaction.type === 'emoji'}
          <img src={reaction.url} alt={reaction.name} class="reaction-emoji" />
        {:else}
          <span class="reaction-text">{reaction.content}</span>
        {/if}
        <span class="reaction-author">
          {#if !compact}
            <Avatar {ndk} pubkey={fetchedEvent.pubkey} size={16} />
          {/if}
          <span class="author-name">
            {author?.name || `${fetchedEvent.pubkey.slice(0, 8)}...`}
          </span>
        </span>
      </div>
    {:else}
      <!-- Regular event display -->
      <div class="event-header">
        {#if !compact}
          <Avatar {ndk} pubkey={fetchedEvent.pubkey} size={32} />
        {/if}
        <div class="event-meta">
          <div class="author-info">
            <span class="author-name">
              {author?.name || `${fetchedEvent.pubkey.slice(0, 8)}...`}
            </span>
            <span class="event-kind">{getEventKindLabel(fetchedEvent.kind)}</span>
          </div>
          <span class="timestamp">{formatTime(fetchedEvent.created_at || 0)}</span>
        </div>
      </div>

      <div class="event-content">
        {#if fetchedEvent.kind === 30023}
          <!-- Article: show title if available -->
          {@const title = fetchedEvent.tagValue('title')}
          {@const summary = fetchedEvent.tagValue('summary')}
          {#if title}
            <h3 class="article-title">{title}</h3>
          {/if}
          {#if summary && !compact}
            <p class="article-summary">{summary}</p>
          {:else}
            <EventContent
              {ndk}
              event={fetchedEvent}
              class="embedded-content"
            />
          {/if}
        {:else if isMediaEvent}
          <!-- Media events: show media preview -->
          {@const imageTag = fetchedEvent.tagValue('image')}
          {@const urlTag = fetchedEvent.tagValue('url')}
          {@const mediaUrl = imageTag || urlTag || fetchedEvent.content}
          {#if mediaUrl}
            <div class="media-preview">
              {#if fetchedEvent.kind === 21 || fetchedEvent.kind === 34235 || fetchedEvent.kind === 34236}
                <video src={mediaUrl} controls={!compact} class="media-element">
                  <track kind="captions" />
                </video>
              {:else}
                <img src={mediaUrl} alt="" class="media-element" />
              {/if}
            </div>
          {/if}
        {:else if fetchedEvent.kind === 6 || fetchedEvent.kind === 16}
          <!-- Repost: show original event ID -->
          {@const repostedId = fetchedEvent.tagValue('e')}
          {#if repostedId}
            <div class="repost-indicator">
              <span class="repost-icon">🔁</span>
              Reposted
            </div>
            <svelte:self {ndk} eventId={repostedId} compact={true} />
          {/if}
        {:else}
          <!-- Regular content -->
          {@const displayContent = getTruncatedContent(fetchedEvent.content)}
          {#if displayContent}
            <EventContent
              {ndk}
              content={displayContent}
              emojiTags={fetchedEvent.tags.filter(t => t[0] === 'emoji')}
              class="embedded-content"
            />
          {/if}
        {/if}
      </div>
    {/if}
  {:else}
    <div class="error">No event to display</div>
  {/if}
</div>

<style>
  .embedded-event {
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--card-background, #ffffff);
    transition: all 0.2s;
    cursor: pointer;
    margin: 0.5rem 0;
  }

  .embedded-event:hover {
    background: var(--card-hover-background, #f9fafb);
    border-color: var(--border-hover-color, #d1d5db);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .embedded-event.compact {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .embedded-event.reaction {
    padding: 0.5rem;
    display: inline-block;
    margin: 0.25rem;
  }

  .loading,
  .error {
    color: var(--text-muted, #6b7280);
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }

  .error {
    color: var(--error-color, #ef4444);
  }

  .event-header {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .event-meta {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .author-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .author-name {
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .event-kind {
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
    background: var(--badge-background, #f3f4f6);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    display: inline-block;
  }

  .timestamp {
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
    white-space: nowrap;
  }

  .event-content {
    margin-top: 0.5rem;
  }

  .article-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .article-summary {
    margin: 0.5rem 0;
    color: var(--text-secondary, #4b5563);
    line-height: 1.5;
  }

  .media-preview {
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .media-element {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    display: block;
  }

  .compact .media-element {
    max-height: 200px;
  }

  .repost-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--text-muted, #6b7280);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .repost-icon {
    font-size: 1rem;
  }

  .reaction-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .reaction-emoji {
    width: 1.5rem;
    height: 1.5rem;
  }

  .reaction-text {
    font-size: 1.5rem;
  }

  .reaction-author {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-muted, #6b7280);
  }

  .embedded-content :global(*) {
    max-width: 100%;
  }
</style>