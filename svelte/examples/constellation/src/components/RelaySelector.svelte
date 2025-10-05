<script lang="ts">
  import { ndk } from '../lib/ndk';
  import type { NDKRelay } from '@nostr-dev-kit/ndk';

  interface Props {
    selectedRelay: string | null;
    onRelayChange: (relay: string | null) => void;
  }

  let { selectedRelay, onRelayChange }: Props = $props();

  let relays = $state<NDKRelay[]>(Array.from(ndk.pool.relays.values()));
  let showMenu = $state(false);
  let showAddRelay = $state(false);
  let newRelayUrl = $state('');

  // Listen to pool events for reactive relay updates
  $effect(() => {
    const updateRelays = () => {
      relays = Array.from(ndk.pool.relays.values());
    };

    ndk.pool.on('relay:connect', updateRelays);
    ndk.pool.on('relay:disconnect', updateRelays);
    ndk.pool.on('relay:connecting', updateRelays);

    return () => {
      ndk.pool.off('relay:connect', updateRelays);
      ndk.pool.off('relay:disconnect', updateRelays);
      ndk.pool.off('relay:connecting', updateRelays);
    };
  });

  const connectedRelays = $derived(relays.filter((r) => r.status >= 5));
  const selectedRelayObj = $derived(
    selectedRelay ? relays.find((r) => r.url === selectedRelay) : null
  );

  // Debug connectivity
  $effect(() => {
    if (relays.length > 0) {
      console.log('🔌 Relay Status:', relays.map(r => ({
        url: r.url,
        status: r.status,
        connectivity: r.connectivity,
        connected: r.status === 1
      })));
    }
  });

  function handleBackdropClick(e: MouseEvent) {
    if (showMenu && !(e.target as Element).closest('.relay-selector')) {
      showMenu = false;
    }
  }

  function getRelayName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  async function handleAddRelay(e: Event) {
    e.preventDefault();
    if (!newRelayUrl.trim()) return;

    try {
      let url = newRelayUrl.trim();
      // Add wss:// if no protocol specified
      if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        url = 'wss://' + url;
      }

      // Validate URL
      new URL(url);

      // Add relay to NDK
      const relay = ndk.addExplicitRelay(url);
      await relay.connect();

      newRelayUrl = '';
      showAddRelay = false;
    } catch (error) {
      console.error('Failed to add relay:', error);
      alert('Failed to add relay. Please check the URL.');
    }
  }
</script>

<svelte:window onclick={handleBackdropClick} />

<div class="relay-selector">
  <button class="relay-btn" onclick={() => (showMenu = !showMenu)} type="button">
    <span class="relay-icon">🔌</span>
    <span class="relay-label">
      {#if selectedRelayObj}
        {getRelayName(selectedRelayObj.url)}
      {:else}
        All Relays
      {/if}
    </span>
    <span class="relay-count">{connectedRelays.length}</span>
  </button>

  {#if showMenu}
    <div class="relay-dropdown">
      <div class="relay-header">
        <span>Select Relay</span>
        <span class="connected-count">{connectedRelays.length} connected</span>
      </div>

      <button
        class="relay-item"
        class:selected={selectedRelay === null}
        onclick={() => {
          onRelayChange(null);
          showMenu = false;
        }}
        type="button"
      >
        <span class="relay-status all">🌐</span>
        <div class="relay-info">
          <div class="relay-name">All Relays</div>
          <div class="relay-url">View bookmarks from all connected relays</div>
        </div>
      </button>

      <div class="relay-divider"></div>

      {#if showAddRelay}
        <form class="add-relay-form" onsubmit={handleAddRelay}>
          <input
            type="text"
            placeholder="wss://relay.example.com"
            bind:value={newRelayUrl}
            class="relay-input"
            autofocus
          />
          <div class="add-relay-actions">
            <button type="submit" class="btn-primary">Add</button>
            <button type="button" class="btn-secondary" onclick={() => { showAddRelay = false; newRelayUrl = ''; }}>
              Cancel
            </button>
          </div>
        </form>
      {:else}
        <button
          class="relay-item add-relay-btn"
          onclick={() => (showAddRelay = true)}
          type="button"
        >
          <span class="relay-status">➕</span>
          <div class="relay-info">
            <div class="relay-name">Add Relay</div>
            <div class="relay-url">Connect to a new relay</div>
          </div>
        </button>
      {/if}

      <div class="relay-divider"></div>

      {#each relays as relay}
        {@const isConnected = relay.status >= 5}
        {@const isSelected = selectedRelay === relay.url}
        <button
          class="relay-item"
          class:selected={isSelected}
          class:disconnected={!isConnected}
          onclick={() => {
            onRelayChange(relay.url);
            showMenu = false;
          }}
          type="button"
          disabled={!isConnected}
        >
          <span class="relay-status" class:connected={isConnected}>
            {isConnected ? '🟢' : '🔴'}
          </span>
          <div class="relay-info">
            <div class="relay-name">{getRelayName(relay.url)}</div>
            <div class="relay-url">{relay.url}</div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .relay-selector {
    position: relative;
  }

  .relay-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 9999px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    font-size: 0.875rem;
  }

  .relay-btn:hover {
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .relay-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .relay-label {
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relay-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 0.375rem;
    background: var(--accent-purple);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    color: white;
  }

  .relay-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 350px;
    max-width: 450px;
    max-height: 500px;
    overflow-y: auto;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .relay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .connected-count {
    color: var(--text-tertiary);
    font-weight: 400;
  }

  .relay-divider {
    height: 1px;
    background: var(--border);
    margin: 0.5rem 0;
  }

  .relay-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    width: 100%;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-family: inherit;
  }

  .relay-item:hover:not(:disabled) {
    background: var(--bg-card);
  }

  .relay-item.selected {
    background: rgba(168, 85, 247, 0.2);
    border-left: 3px solid var(--accent-purple);
  }

  .relay-item.disconnected {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .relay-status {
    font-size: 0.875rem;
    line-height: 1;
  }

  .relay-status.all {
    font-size: 1.25rem;
  }

  .relay-info {
    flex: 1;
    min-width: 0;
  }

  .relay-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relay-url {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relay-item.selected .relay-url {
    color: var(--accent-purple);
  }

  .add-relay-btn {
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }

  .add-relay-btn:hover {
    border-top-color: var(--accent-purple);
    border-bottom-color: var(--accent-purple);
  }

  .add-relay-form {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .relay-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.875rem;
  }

  .relay-input:focus {
    outline: none;
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .add-relay-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--accent-purple);
    color: white;
  }

  .btn-primary:hover {
    background: #9333ea;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .btn-secondary {
    background: var(--bg-card);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }

  .btn-secondary:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
</style>
