<script lang="ts">
  import type NDK from '@nostr-dev-kit/ndk';
  import { createRelayManager, type PoolType } from '../relay-manager.svelte.js';
  import RelayPoolTabs from './RelayPoolTabs.svelte';
  import RelayList from './RelayList.svelte';
  import RelayAddForm from './RelayAddForm.svelte';

  interface Props {
    ndk: NDK;
    class?: string;
  }

  let { ndk, class: className = '' }: Props = $props();

  const manager = createRelayManager(ndk);

  const filteredRelays = $derived(manager.getFilteredRelays());
  const poolCounts = $derived({
    all: manager.getPoolCount('all'),
    read: manager.getPoolCount('read'),
    write: manager.getPoolCount('write'),
    both: manager.getPoolCount('both'),
    temp: manager.getPoolCount('temp'),
    blacklist: manager.getPoolCount('blacklist'),
  });

  function handlePoolSelect(pool: PoolType) {
    manager.selectedPool = pool;
  }

  async function handleFetchInfo(url: string) {
    await manager.fetchNip11Info(url);
  }

  async function handleAddRelay(url: string, poolType: 'read' | 'write' | 'both') {
    await manager.addRelay(url, poolType);
  }

  async function handleRemoveRelay(url: string) {
    if (confirm(`Are you sure you want to remove ${url}?`)) {
      await manager.removeRelay(url);
    }
  }

  async function handleBlacklistRelay(url: string) {
    if (confirm(`Are you sure you want to blacklist ${url}? This will also remove it from your relay list.`)) {
      await manager.blacklistRelay(url);
    }
  }

  async function handleUnblacklistRelay(url: string) {
    await manager.unblacklistRelay(url);
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  const emptyMessages = {
    all: 'No relays connected. Add a relay to get started.',
    read: 'No read relays configured. Add a relay with read access.',
    write: 'No write relays configured. Add a relay with write access.',
    both: 'No relays configured for both read and write.',
    temp: 'No temporary relays. Temporary relays are automatically added by NDK and will be removed when no longer needed.',
    blacklist: 'No blacklisted relays. Blacklisted relays will not be used for any connections.',
  };
</script>

<div class="relay-manager {className}">
  <div class="relay-manager-header">
    <div class="header-content">
      <h2 class="header-title">Relay Management</h2>
      <p class="header-description">
        Manage your Nostr relay connections and view detailed information about each relay.
      </p>
    </div>
    {#if manager.selectedPool !== 'blacklist'}
      <div class="header-actions">
        <RelayAddForm onAdd={handleAddRelay} />
      </div>
    {/if}
  </div>

  <RelayPoolTabs
    selected={manager.selectedPool}
    onSelect={handlePoolSelect}
    counts={poolCounts}
  />

  <div class="relay-manager-body">
    <RelayList
      relays={filteredRelays}
      onFetchInfo={handleFetchInfo}
      onRemove={handleRemoveRelay}
      onBlacklist={handleBlacklistRelay}
      onUnblacklist={handleUnblacklistRelay}
      onCopyUrl={handleCopyUrl}
      emptyMessage={emptyMessages[manager.selectedPool]}
    >
      {#if manager.selectedPool === 'all' || manager.selectedPool === 'read' || manager.selectedPool === 'write' || manager.selectedPool === 'both'}
        <RelayAddForm onAdd={handleAddRelay} />
      {/if}
    </RelayList>
  </div>
</div>

<style>
  .relay-manager {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--manager-bg, #ffffff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 1rem;
    overflow: hidden;
  }

  .relay-manager-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .header-content {
    flex: 1;
    min-width: 250px;
  }

  .header-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .header-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    line-height: 1.5;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .relay-manager-body {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    .relay-manager-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      width: 100%;
    }

    .relay-manager-body {
      padding: 1rem;
    }
  }
</style>
