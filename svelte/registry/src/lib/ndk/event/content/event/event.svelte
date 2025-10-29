<!-- @ndk-version: embedded-event@0.0.0 -->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEmbeddedEvent } from '@nostr-dev-kit/svelte';

  interface EmbeddedEventProps {
    ndk: NDKSvelte;
    bech32: string;
    class?: string;
  }

  let { ndk, bech32, class: className = '' }: EmbeddedEventProps = $props();

  const embedded = createEmbeddedEvent(() => ({ bech32 }), ndk);
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
    border: 1px solid var(--border);
    border-left: 3px solid var(--primary);
    border-radius: 0.5rem;
    background: var(--muted);
  }

  .loading,
  .error {
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  .error {
    color: var(--destructive);
  }

  .event-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-content {
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
    background: linear-gradient(transparent, var(--muted));
  }

  .event-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .event-author {
    font-weight: 500;
  }

  .event-time::before {
    content: '•';
    margin-right: 0.5rem;
  }
</style>
