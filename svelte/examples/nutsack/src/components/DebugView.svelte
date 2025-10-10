<script lang="ts">
  import { onMount } from 'svelte';
  import type NDK from '@nostr-dev-kit/ndk';
  import type { NDKCacheAdapterSqliteWasm, CacheStats } from '@nostr-dev-kit/cache-sqlite-wasm';

  interface Props {
    ndk: NDK;
    onBack: () => void;
  }

  let { ndk, onBack }: Props = $props();

  let stats = $state<CacheStats | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function loadCacheStats() {
    loading = true;
    error = null;

    try {
      const cacheAdapter = ndk.cacheAdapter as NDKCacheAdapterSqliteWasm;

      if (!cacheAdapter) {
        throw new Error('Cache adapter not found');
      }

      if (!cacheAdapter.getCacheStats) {
        throw new Error('getCacheStats method not available');
      }

      stats = await cacheAdapter.getCacheStats();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error occurred';
      console.error('Failed to load cache stats:', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadCacheStats();
  });

  function getKindName(kind: number): string {
    const kindNames: Record<number, string> = {
      0: 'Profile Metadata',
      1: 'Short Text Note',
      3: 'Contacts',
      4: 'Encrypted DM',
      5: 'Event Deletion',
      6: 'Repost',
      7: 'Reaction',
      9735: 'Zap',
      9321: 'NIP-61 Nutzap',
      10000: 'Mute List',
      10002: 'Relay List',
      30000: 'People List',
      30008: 'Profile Badges',
      30009: 'Badge Definition',
      37375: 'NIP-60 Wallet',
      7375: 'Cashu Token',
    };
    return kindNames[kind] || `Kind ${kind}`;
  }
</script>

<div class="debug-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Debug</h2>
    <button class="refresh-button" onclick={loadCacheStats}>
      🔄
    </button>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading cache statistics...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>❌ {error}</p>
      <button class="retry-button" onclick={loadCacheStats}>Retry</button>
    </div>
  {:else if stats}
    <div class="stats-container">
      <!-- Overview Section -->
      <div class="section">
        <h3>Cache Overview</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{stats.totalEvents.toLocaleString()}</div>
            <div class="stat-label">Total Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats.totalProfiles.toLocaleString()}</div>
            <div class="stat-label">Profiles</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats.totalEventTags.toLocaleString()}</div>
            <div class="stat-label">Event Tags</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats.eventRelays.toLocaleString()}</div>
            <div class="stat-label">Event-Relay Links</div>
          </div>
        </div>
      </div>

      <!-- Events by Kind Section -->
      <div class="section">
        <h3>Events by Kind</h3>
        <div class="kinds-list">
          {#each Object.entries(stats.eventsByKind).sort((a, b) => b[1] - a[1]) as [kind, count]}
            <div class="kind-row">
              <div class="kind-info">
                <span class="kind-number">{kind}</span>
                <span class="kind-name">{getKindName(Number(kind))}</span>
              </div>
              <div class="kind-count">{count.toLocaleString()}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Other Tables Section -->
      <div class="section">
        <h3>Other Cache Tables</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{stats.totalDecryptedEvents.toLocaleString()}</div>
            <div class="stat-label">Decrypted Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats.totalUnpublishedEvents.toLocaleString()}</div>
            <div class="stat-label">Unpublished Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats.cacheData.toLocaleString()}</div>
            <div class="stat-label">Cache Data</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .debug-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .view-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
  }

  .back-button, .refresh-button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-button:hover, .refresh-button:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .refresh-button {
    font-size: 1.2rem;
  }

  h2 {
    text-align: center;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgb(249, 115, 22);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-state p {
    color: rgb(239, 68, 68);
  }

  .retry-button {
    padding: 0.75rem 1.5rem;
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: 8px;
  }

  .retry-button:hover {
    background: rgba(249, 115, 22, 0.2);
  }

  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    text-align: center;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: rgb(249, 115, 22);
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .kinds-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .kind-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
  }

  .kind-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .kind-number {
    font-family: monospace;
    font-size: 0.875rem;
    color: rgb(249, 115, 22);
    font-weight: 600;
    min-width: 3rem;
  }

  .kind-name {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .kind-count {
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
</style>
