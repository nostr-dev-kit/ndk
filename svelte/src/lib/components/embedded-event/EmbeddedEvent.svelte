<!--
  @component EmbeddedEvent - Main dispatcher for rendering embedded Nostr events

  Automatically selects the appropriate renderer based on event kind:
  - Articles (30023) → ArticlePreview
  - Text notes (1, 1111) → NotePreview
  - All others → GenericPreview

  Easily extensible - just import new renderers and add them to the getRenderer function.

  @example
  ```svelte
  <EmbeddedEvent
    {ndk}
    bech32="note1..."
    onEventClick={(bech32, event) => goto(`/e/${event.id}`)}
  />
  ```
-->
<script lang="ts">
  import { nip19, type AddressPointer, type EventPointer } from 'nostr-tools';
  import type { NDKEvent, NDKSvelte } from '@nostr-dev-kit/ndk';
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import ArticlePreview from './ArticlePreview.svelte';
  import NotePreview from './NotePreview.svelte';
  import GenericPreview from './GenericPreview.svelte';

  interface Props {
    /** NDKSvelte instance for fetching event data */
    ndk: NDKSvelte;
    /** The bech32-encoded event reference (note1, nevent1, or naddr1) */
    bech32: string;
    /** Additional CSS classes */
    class?: string;
    /** Callback when the embedded event is clicked */
    onEventClick?: (bech32: string, event: NDKEvent) => void;
  }

  let {
    ndk,
    bech32,
    class: className = '',
    onEventClick,
  }: Props = $props();

  let fetchedEvent = $state<NDKEvent | null>(null);
  let author = $state<{ name?: string; picture?: string } | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Helper to fetch author profile for an event
  async function fetchAuthorProfile(event: NDKEvent) {
    const user = ndk.getUser({ pubkey: event.pubkey });
    if (!user.profile) {
      await user.fetchProfile();
    }
    author = user.profile || null;
  }

  // Helper to handle event fetch result
  async function handleEventFetched(event: NDKEvent | null, errorMsg: string) {
    if (event) {
      fetchedEvent = event;
      await fetchAuthorProfile(event);
    } else {
      error = errorMsg;
    }
    loading = false;
  }

  // Fetch event based on bech32
  $effect(() => {
    if (!bech32 || !ndk) return;

    loading = true;
    error = null;

    try {
      const decoded = nip19.decode(bech32);

      if (decoded.type === 'note') {
        // Simple note ID
        const eventId = decoded.data as string;
        ndk.fetchEvent(eventId)
          .then((event) => handleEventFetched(event, 'Event not found'))
          .catch((err) => {
            console.error('Failed to fetch event:', err);
            error = 'Failed to load event';
            loading = false;
          });
      } else if (decoded.type === 'nevent') {
        // Event pointer with optional relays
        const pointer = decoded.data as EventPointer;
        ndk.fetchEvent(pointer.id)
          .then((event) => handleEventFetched(event, 'Event not found'))
          .catch((err) => {
            console.error('Failed to fetch event:', err);
            error = 'Failed to load event';
            loading = false;
          });
      } else if (decoded.type === 'naddr') {
        // Address pointer for replaceable/parameterized events
        const pointer = decoded.data as AddressPointer;
        const filter = {
          kinds: [pointer.kind as NDKKind],
          authors: [pointer.pubkey],
          '#d': [pointer.identifier]
        };

        ndk.fetchEvent(filter, { closeOnEose: true })
          .then((event) => handleEventFetched(event, 'Event not found'))
          .catch((err) => {
            console.error('Failed to fetch event by address:', err);
            error = 'Failed to load event';
            loading = false;
          });
      } else {
        error = 'Invalid event reference';
        loading = false;
      }
    } catch (err) {
      console.error('Failed to decode bech32:', err);
      error = 'Invalid bech32 format';
      loading = false;
    }
  });

  // Handle click
  function handleClick() {
    if (onEventClick && fetchedEvent) {
      onEventClick(bech32, fetchedEvent);
    }
  }

  // Get the appropriate renderer component for the event kind
  function getRenderer(event: NDKEvent) {
    const kind = event.kind;

    // Map of kind to renderer component
    // Add new renderers here as we support more event kinds
    const rendererMap: Record<number, any> = {
      // Text notes
      [NDKKind.Text]: NotePreview,
      [NDKKind.GenericReply]: NotePreview,

      // Long-form content
      [NDKKind.Article]: ArticlePreview,

      // Media events (could create specific renderers for these)
      [NDKKind.Image]: GenericPreview,
      [NDKKind.Video]: GenericPreview,
      [NDKKind.ShortVideo]: GenericPreview,
      [NDKKind.HorizontalVideo]: GenericPreview,
      [NDKKind.VerticalVideo]: GenericPreview,

      // Social interactions (could create specific renderers)
      [NDKKind.Repost]: GenericPreview,
      [NDKKind.GenericRepost]: GenericPreview,
      [NDKKind.Reaction]: GenericPreview,
      [NDKKind.Zap]: GenericPreview,

      // Lists and sets (could create specific renderers)
      [NDKKind.MuteList]: GenericPreview,
      [NDKKind.PinList]: GenericPreview,
      [NDKKind.BookmarkList]: GenericPreview,
      [NDKKind.FollowSet]: GenericPreview,
      [NDKKind.RelaySet]: GenericPreview,

      // Marketplace (could create specific renderers)
      [NDKKind.MarketStall]: GenericPreview,
      [NDKKind.MarketProduct]: GenericPreview,
      [NDKKind.Classified]: GenericPreview,

      // Add more specific renderers as needed...
    };

    return rendererMap[kind] || GenericPreview;
  }

  // Get kind label for generic preview
  function getKindLabel(kind: number): string | undefined {
    const labels: Record<number, string> = {
      [NDKKind.Metadata]: 'Profile',
      [NDKKind.Text]: 'Note',
      [NDKKind.Contacts]: 'Contact List',
      [NDKKind.EncryptedDirectMessage]: 'Encrypted Message',
      [NDKKind.EventDeletion]: 'Event Deletion',
      [NDKKind.Repost]: 'Repost',
      [NDKKind.Reaction]: 'Reaction',
      [NDKKind.BadgeAward]: 'Badge Award',
      [NDKKind.GenericRepost]: 'Generic Repost',
      [NDKKind.ChannelCreation]: 'Channel Creation',
      [NDKKind.ChannelMetadata]: 'Channel Metadata',
      [NDKKind.ChannelMessage]: 'Channel Message',
      [NDKKind.Image]: 'Image',
      [NDKKind.Video]: 'Video',
      [NDKKind.ShortVideo]: 'Short Video',
      [NDKKind.Story]: 'Story',
      [NDKKind.Article]: 'Article',
      [NDKKind.HorizontalVideo]: 'Horizontal Video',
      [NDKKind.VerticalVideo]: 'Vertical Video',
      [NDKKind.Media]: 'Media',
      [NDKKind.GenericReply]: 'Reply',
      [NDKKind.Highlight]: 'Highlight',
      [NDKKind.ZapRequest]: 'Zap Request',
      [NDKKind.Zap]: 'Zap',
      [NDKKind.MuteList]: 'Mute List',
      [NDKKind.PinList]: 'Pin List',
      [NDKKind.RelayList]: 'Relay List',
      [NDKKind.BookmarkList]: 'Bookmark List',
      [NDKKind.CommunityList]: 'Community List',
      [NDKKind.PublicChatList]: 'Public Chat List',
      [NDKKind.FollowSet]: 'Follow Set',
      [NDKKind.RelaySet]: 'Relay Set',
      [NDKKind.BookmarkSet]: 'Bookmark Set',
      [NDKKind.ArticleCurationSet]: 'Article Curation',
      [NDKKind.VideoCurationSet]: 'Video Curation',
      [NDKKind.ProfileBadge]: 'Profile Badge',
      [NDKKind.BadgeDefinition]: 'Badge Definition',
      [NDKKind.MarketStall]: 'Market Stall',
      [NDKKind.MarketProduct]: 'Product',
      [NDKKind.Classified]: 'Classified',
      [NDKKind.Wiki]: 'Wiki',
      [NDKKind.AppRecommendation]: 'App Recommendation',
      [NDKKind.AppHandler]: 'App Handler',
    };

    return labels[kind];
  }

  const RendererComponent = $derived(fetchedEvent ? getRenderer(fetchedEvent) : null);
  const kindLabel = $derived(fetchedEvent ? getKindLabel(fetchedEvent.kind) : undefined);
</script>

<div class="embedded-event-wrapper {className}">
  {#if loading}
    <div class="loading">
      <span class="loading-spinner"></span>
      <span>Loading event...</span>
    </div>
  {:else if error}
    <div class="error">
      <span class="error-icon">⚠️</span>
      <span>{error}</span>
    </div>
  {:else if fetchedEvent && RendererComponent}
    <RendererComponent
      {ndk}
      event={fetchedEvent}
      {author}
      onClick={handleClick}
      {kindLabel}
    />
  {:else}
    <div class="error">
      <span class="error-icon">❌</span>
      <span>No event to display</span>
    </div>
  {/if}
</div>

<style>
  .embedded-event-wrapper {
    position: relative;
  }

  .loading,
  .error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--card-background, #ffffff);
    margin: 0.5rem 0;
  }

  .loading {
    color: var(--text-muted, #6b7280);
  }

  .error {
    color: var(--error-color, #ef4444);
    background: var(--error-background, #fef2f2);
    border-color: var(--error-border, #fecaca);
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color, #e5e7eb);
    border-top-color: var(--accent-color, #8b5cf6);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .error-icon {
    font-size: 1.25rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>