<!-- @ndk-version: handler-info-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../../../../event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();

  // NIP-89: Extract handler information
  const handlerId = event.tagValue('d');
  const supportedKinds = event.getMatchingTags('k').map(tag => tag[1]);

  // Parse handler metadata from content (JSON)
  let metadata: any = {};
  try {
    if (event.content) {
      metadata = JSON.parse(event.content);
    }
  } catch {
    // Invalid JSON, ignore
  }

  // Extract platform-specific handlers
  interface PlatformHandler {
    platform: string;
    url: string;
  }

  const platformHandlers: PlatformHandler[] = [];

  // Web handlers
  const webTag = event.tags.find(tag => tag[0] === 'web');
  if (webTag && webTag[1]) {
    platformHandlers.push({ platform: 'web', url: webTag[1] });
  }

  // iOS handlers
  const iosTag = event.tags.find(tag => tag[0] === 'ios');
  if (iosTag && iosTag[1]) {
    platformHandlers.push({ platform: 'ios', url: iosTag[1] });
  }

  // Android handlers
  const androidTag = event.tags.find(tag => tag[0] === 'android');
  if (androidTag && androidTag[1]) {
    platformHandlers.push({ platform: 'android', url: androidTag[1] });
  }
</script>

<div class="handler-info-embedded" data-variant={variant}>
  <EventCard.Root {ndk} {event}>
    <EventCard.Header
      variant={variant === 'compact' ? 'compact' : 'full'}
      avatarSize={variant === 'compact' ? 'sm' : 'md'}
      showTimestamp={true}
    />
  </EventCard.Root>

  <div class="handler-content">
    {#if metadata.name || metadata.display_name}
      <div class="app-name">
        {metadata.display_name || metadata.name}
      </div>
    {/if}

    {#if metadata.about}
      <div class="app-description">
        {metadata.about}
      </div>
    {/if}

    {#if supportedKinds.length > 0}
      <div class="supported-kinds">
        <div class="section-header">Supported Event Kinds:</div>
        <div class="kinds-list">
          {#each supportedKinds as kind}
            <span class="kind-badge">Kind {kind}</span>
          {/each}
        </div>
      </div>
    {/if}

    {#if platformHandlers.length > 0}
      <div class="platforms">
        <div class="section-header">Platform Handlers:</div>
        {#each platformHandlers as handler}
          <div class="platform-item">
            <span class="platform-badge">{handler.platform}</span>
            <code class="handler-url">{handler.url}</code>
          </div>
        {/each}
      </div>
    {/if}

    {#if metadata.picture}
      <div class="app-image">
        <img src={metadata.picture} alt={metadata.name || 'App icon'} />
      </div>
    {/if}
  </div>
</div>

<style>
  .handler-info-embedded {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-card);
    padding: 0.75rem;
  }

  .handler-content {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: var(--color-muted);
    border-radius: 0.375rem;
  }

  .app-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 0.5rem;
  }

  .app-description {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    line-height: 1.5;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  .supported-kinds,
  .platforms {
    margin-top: 0.75rem;
  }

  .section-header {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--muted-foreground);
    margin-bottom: 0.5rem;
    letter-spacing: 0.025em;
  }

  .kinds-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .kind-badge {
    padding: 0.25rem 0.5rem;
    background: var(--color-primary);
    color: var(--primary-foreground);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .platform-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--color-card);
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .platform-item:last-child {
    margin-bottom: 0;
  }

  .platform-badge {
    padding: 0.25rem 0.5rem;
    background: var(--color-accent);
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--accent-foreground);
    flex-shrink: 0;
  }

  .handler-url {
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--foreground);
    word-break: break-all;
    background: var(--color-muted);
    padding: 0.125rem 0.25rem;
    border-radius: 0.125rem;
  }

  .app-image {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
  }

  .app-image img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 0.375rem;
    object-fit: contain;
  }
</style>
