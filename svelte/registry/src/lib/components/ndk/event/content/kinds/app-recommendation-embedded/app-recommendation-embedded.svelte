<!-- @ndk-version: app-recommendation-embedded@0.1.0 -->
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

  // NIP-89: Extract handler recommendations
  const supportedKind = event.tagValue('d');
  const handlerTags = event.getMatchingTags('a');

  interface HandlerRecommendation {
    address: string;
    relay?: string;
    platform?: string;
  }

  const handlers: HandlerRecommendation[] = handlerTags.map((tag) => {
    const [, address, relay, ...rest] = tag;
    const platform = rest.find((item) => item && !item.startsWith('wss://'));

    return {
      address,
      relay: relay && relay.startsWith('wss://') ? relay : undefined,
      platform
    };
  });
</script>

<div class="app-recommendation-embedded" data-variant={variant}>
  <EventCard.Root {ndk} {event}>
    <EventCard.Header
      variant={variant === 'compact' ? 'compact' : 'full'}
      avatarSize={variant === 'compact' ? 'sm' : 'md'}
      showTimestamp={true}
    />
  </EventCard.Root>

  <div class="recommendation-content">
    <div class="kind-info">
      <span class="label">Recommends handlers for:</span>
      <span class="kind-badge">Kind {supportedKind}</span>
    </div>

    {#if handlers.length > 0}
      <div class="handlers-list">
        <div class="handlers-header">Recommended Applications:</div>
        {#each handlers as handler, index}
          <div class="handler-item">
            <div class="handler-address">
              {#if handler.platform}
                <span class="platform-badge">{handler.platform}</span>
              {/if}
              <span class="address">{handler.address}</span>
            </div>
            {#if handler.relay}
              <div class="relay-hint">{handler.relay}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .app-recommendation-embedded {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-card);
    padding: 0.75rem;
  }

  .recommendation-content {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: var(--color-muted);
    border-radius: 0.375rem;
  }

  .kind-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .label {
    color: var(--muted-foreground);
    font-weight: 500;
  }

  .kind-badge {
    padding: 0.25rem 0.5rem;
    background: var(--color-primary);
    color: var(--primary-foreground);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .handlers-list {
    border-top: 1px solid var(--color-border);
    padding-top: 0.75rem;
  }

  .handlers-header {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--muted-foreground);
    margin-bottom: 0.5rem;
    letter-spacing: 0.025em;
  }

  .handler-item {
    padding: 0.5rem;
    background: var(--color-card);
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .handler-item:last-child {
    margin-bottom: 0;
  }

  .handler-address {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .platform-badge {
    padding: 0.125rem 0.375rem;
    background: var(--color-accent);
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--accent-foreground);
  }

  .address {
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--foreground);
    word-break: break-all;
  }

  .relay-hint {
    font-size: 0.625rem;
    color: var(--muted-foreground);
    font-family: monospace;
    margin-left: 0.25rem;
  }
</style>
