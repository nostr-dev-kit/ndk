<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Relay } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');
  const relayUrl = 'wss://relay.damus.io';
</script>

<div class="relay-card">
  <Relay.Root {ndk} {relayUrl}>
    <div class="relay-header">
      <Relay.Icon class="relay-icon" />
      <div class="relay-info">
        <Relay.Name class="relay-name" />
        <Relay.Url class="relay-url" />
      </div>
      <Relay.ConnectionStatus showLabel class="relay-status" />
    </div>

    <Relay.Description class="relay-description" />

    <div class="relay-footer">
      <Relay.BookmarkButton class="bookmark-button" />
    </div>
  </Relay.Root>
</div>

<style>
  .relay-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .relay-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .relay-card :global(.relay-icon) {
    width: 3rem;
    height: 3rem;
    flex-shrink: 0;
  }

  .relay-info {
    flex: 1;
  }

  .relay-card :global(.relay-name) {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    display: block;
    margin-bottom: 0.25rem;
  }

  .relay-card :global(.relay-url) {
    font-size: 0.875rem;
    color: #6b7280;
    font-family: monospace;
  }

  .relay-card :global(.relay-status) {
    font-size: 0.75rem;
  }

  .relay-card :global(.relay-description) {
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #4b5563;
    margin-bottom: 1rem;
  }

  .relay-footer {
    display: flex;
    justify-content: flex-end;
  }

  .relay-card :global(.bookmark-button) {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .relay-card :global(.bookmark-button:hover) {
    background: #f9fafb;
  }
</style>
