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

  // Get pool counts dynamically from available pools
  const poolCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    const poolNames = manager.getPoolNames();

    for (const name of poolNames) {
      counts[name] = manager.getPoolCount(name);
    }

    return counts;
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

  const emptyMessage = $derived.by(() => {
    if (manager.selectedPool === 'all') {
      return 'No relays connected. Add a relay to get started.';
    }
    return `No relays in the "${manager.selectedPool}" pool.`;
  });
</script>

<div class="relay-manager {className}">
  <div class="relay-manager-header">
    <div class="header-content">
      <h2 class="header-title">Relay Management</h2>
      <p class="header-description">
        Manage your Nostr relay connections and view detailed information about each relay.
      </p>
    </div>
    <div class="header-actions">
      <RelayAddForm onAdd={handleAddRelay} />
    </div>
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
      emptyMessage={emptyMessage}
    />
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
