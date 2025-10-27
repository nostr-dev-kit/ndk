<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEmbeddedEvent } from '@nostr-dev-kit/svelte';

  interface EmbeddedEventProps {
    ndk: NDKSvelte;
    bech32: string;
    class?: string;
  }

  let { ndk, bech32, class: className = '' }: EmbeddedEventProps = $props();

  const embedded = createEmbeddedEvent({ ndk, bech32: () => bech32 });
</script>

<div class="embedded-event {className}">
  {#if embedded.loading}
    <div class="loading">Loading event...</div>
  {:else if embedded.error}
    <div class="error">{embedded.error}</div>
  {:else if embedded.event}
    <div class="event-preview">
      <div class="event-content">
        {embedded.event.content}
      </div>
      <div class="event-meta">
        <span class="event-author">
          {embedded.event.author?.profile?.name || embedded.event.pubkey.slice(0, 8)}
        </span>
        <span class="event-time">
          {new Date((embedded.event.created_at || 0) * 1000).toLocaleDateString()}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .embedded-event {
    margin: 0.75rem 0;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-left: 3px solid #2563eb;
    border-radius: 0.5rem;
    background: #f9fafb;
  }

  .loading,
  .error {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .error {
    color: #dc2626;
  }

  .event-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-content {
    color: #111827;
    line-height: 1.5;
    max-height: 150px;
    overflow: hidden;
    position: relative;
  }

  .event-content::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2rem;
    background: linear-gradient(transparent, #f9fafb);
  }

  .event-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .event-author {
    font-weight: 500;
  }

  .event-time::before {
    content: '•';
    margin-right: 0.5rem;
  }
</style>
