<!-- @ndk-version: generic-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();

  // NIP-31: Check for alt tag
  const altTag = event.tagValue('alt');

  // NIP-89: Handler discovery
  interface HandlerInfo {
    name?: string;
    about?: string;
    picture?: string;
    web?: string;
    ios?: string;
    android?: string;
  }

  let handlers = $state<HandlerInfo[]>([]);
  let loadingHandlers = $state(true);

  // Query for NIP-89 handlers
  async function discoverHandlers() {
    if (!event.kind) {
      loadingHandlers = false;
      return;
    }

    try {
      // Step 1: Query for recommendations (kind 31989) for this event kind
      const recommendationFilter: NDKFilter = {
        kinds: [31989],
        '#d': [event.kind.toString()],
        limit: 10
      };

      const recommendations = await ndk.fetchEvents(recommendationFilter);
      const handlerAddresses = new Set<string>();

      // Extract handler addresses from recommendations
      for (const rec of recommendations) {
        const aTags = rec.getMatchingTags('a');
        for (const tag of aTags) {
          if (tag[1]) {
            handlerAddresses.add(tag[1]);
          }
        }
      }

      // Step 2: Fetch handler info events (kind 31990)
      if (handlerAddresses.size > 0) {
        const handlerFilter: NDKFilter = {
          kinds: [31990],
          limit: 20
        };

        const handlerEvents = await ndk.fetchEvents(handlerFilter);
        const discoveredHandlers: HandlerInfo[] = [];

        for (const handler of handlerEvents) {
          // Check if this handler supports our event kind
          const supportedKinds = handler.getMatchingTags('k').map(tag => tag[1]);
          if (!supportedKinds.includes(event.kind.toString())) continue;

          // Parse metadata
          let metadata: any = {};
          try {
            if (handler.content) {
              metadata = JSON.parse(handler.content);
            }
          } catch {}

          // Extract platform URLs
          const webTag = handler.tags.find(tag => tag[0] === 'web');
          const iosTag = handler.tags.find(tag => tag[0] === 'ios');
          const androidTag = handler.tags.find(tag => tag[0] === 'android');

          discoveredHandlers.push({
            name: metadata.display_name || metadata.name,
            about: metadata.about,
            picture: metadata.picture,
            web: webTag?.[1],
            ios: iosTag?.[1],
            android: androidTag?.[1]
          });
        }

        handlers = discoveredHandlers;
      }
    } catch (error) {
      console.error('Error discovering NIP-89 handlers:', error);
    } finally {
      loadingHandlers = false;
    }
  }

  // Generate URL for opening this event
  function getHandlerUrl(handler: HandlerInfo, platform: 'web' | 'ios' | 'android'): string | undefined {
    const template = handler[platform];
    if (!template) return undefined;

    const bech32 = event.encode();
    return template.replace(/<bech32>/g, bech32);
  }

  // Start discovery on mount
  $effect(() => {
    discoverHandlers();
  });
</script>

<div class="generic-embedded" data-variant={variant}>
  {#if altTag}
    <!-- NIP-31: Show alt tag content for unknown kinds -->
    <div class="alt-content">
      <div class="kind-badge">
        Kind {event.kind}
      </div>
      <p class="alt-text">{altTag}</p>
    </div>
    <EventCard.Root {ndk} {event}>
      <EventCard.Header
        variant={variant === 'compact' ? 'compact' : 'full'}
        avatarSize={variant === 'compact' ? 'sm' : 'md'}
        showTimestamp={true}
      />
    </EventCard.Root>
  {:else}
    <!-- Standard fallback for events without alt tag -->
    <EventCard.Root {ndk} {event}>
      <EventCard.Header
        variant={variant === 'compact' ? 'compact' : 'full'}
        avatarSize={variant === 'compact' ? 'sm' : 'md'}
        showTimestamp={true}
      />
      <EventCard.Content
        truncate={variant === 'compact' ? 100 : 200}
      />
    </EventCard.Root>

    <div class="kind-badge">
      Kind {event.kind}
    </div>
  {/if}

  <!-- NIP-89: Show available handlers -->
  {#if !loadingHandlers && handlers.length > 0}
    <div class="handlers-section">
      <div class="handlers-header">
        Open in compatible app:
      </div>

      <div class="handlers-list">
        {#each handlers as handler}
          <div class="handler-card">
            <div class="handler-info">
              {#if handler.picture}
                <img src={handler.picture} alt={handler.name || 'App icon'} class="handler-icon" />
              {/if}
              <div class="handler-details">
                {#if handler.name}
                  <div class="handler-name">{handler.name}</div>
                {/if}
                {#if handler.about && variant !== 'compact'}
                  <div class="handler-about">{handler.about}</div>
                {/if}
              </div>
            </div>

            <div class="handler-platforms">
              {#if handler.web}
                {@const url = getHandlerUrl(handler, 'web')}
                {#if url}
                  <a href={url} target="_blank" rel="noopener noreferrer" class="platform-link">
                    <span class="platform-badge">Web</span>
                  </a>
                {/if}
              {/if}

              {#if handler.ios}
                {@const url = getHandlerUrl(handler, 'ios')}
                {#if url}
                  <a href={url} class="platform-link">
                    <span class="platform-badge">iOS</span>
                  </a>
                {/if}
              {/if}

              {#if handler.android}
                {@const url = getHandlerUrl(handler, 'android')}
                {#if url}
                  <a href={url} class="platform-link">
                    <span class="platform-badge">Android</span>
                  </a>
                {/if}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if loadingHandlers && variant === 'card'}
    <div class="handlers-loading">
      Discovering compatible apps...
    </div>
  {/if}
</div>

<style>
  .generic-embedded {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-card);
    padding: 0.75rem;
  }

  .alt-content {
    margin-bottom: 0.75rem;
  }

  .alt-text {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: var(--color-muted);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--foreground);
    border-left: 3px solid var(--color-primary);
  }

  .kind-badge {
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: var(--color-muted);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
    display: inline-block;
  }

  /* NIP-89 Handler UI */
  .handlers-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  .handlers-header {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--muted-foreground);
    margin-bottom: 0.75rem;
    letter-spacing: 0.025em;
  }

  .handlers-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .handler-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: var(--color-muted);
    border-radius: 0.375rem;
    gap: 0.75rem;
  }

  .handler-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .handler-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.375rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  .handler-details {
    flex: 1;
    min-width: 0;
  }

  .handler-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .handler-about {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-top: 0.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .handler-platforms {
    display: flex;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .platform-link {
    text-decoration: none;
    transition: transform 0.15s ease;
  }

  .platform-link:hover {
    transform: scale(1.05);
  }

  .platform-badge {
    padding: 0.375rem 0.625rem;
    background: var(--color-primary);
    color: var(--primary-foreground);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-block;
  }

  .platform-badge:hover {
    opacity: 0.9;
  }

  .handlers-loading {
    margin-top: 0.75rem;
    padding: 0.75rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted-foreground);
    background: var(--color-muted);
    border-radius: 0.375rem;
  }
</style>
