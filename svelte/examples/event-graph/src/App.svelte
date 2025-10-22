<script lang="ts">
  import { ndk } from './lib/ndk';
  import type { NDKUser, NDKEvent, NDKRelay } from '@nostr-dev-kit/ndk';
  import { getRelayListForUser } from '@nostr-dev-kit/ndk';
  import { createSyncSubscription } from '@nostr-dev-kit/svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import EventGraph from './EventGraph.svelte';

  console.log('[App] Component loaded');

  interface RelayProgress {
    url: string;
    status: 'pending' | 'syncing' | 'completed';
    eventCount: number;
  }

  let nip05Input = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let user = $state<NDKUser | null>(null);
  let connectedRelays = $state<string[]>([]);
  let isSubscribed = $state(false);

  // Sync progress tracking
  let syncProgress = $state<RelayProgress[]>([]);
  let syncComplete = $state(false);
  let syncing = $state(false);
  let syncBarCollapsed = $state(false);
  let showResults = $state(false);

  // Filter function to skip ephemeral events (kinds 20000-29999)
  function isEphemeralEvent(event: NDKEvent): boolean {
    const kind = event.kind || 0;
    return kind >= 20000 && kind <= 29999;
  }

  // Reactive subscription using createSyncSubscription
  const subscription = createSyncSubscription(ndk, () => {
    if (!isSubscribed || !user || connectedRelays.length === 0) return undefined;

    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

    return {
      filters: {
        authors: [user.pubkey],
        since: sevenDaysAgo,
      },
      relayUrls: connectedRelays,
      onRelaySynced: (relay: NDKRelay, count: number) => {
        console.log(`[App] Synced ${count} events from ${relay.url}`);

        const relayIdx = syncProgress.findIndex(r => r.url === relay.url);
        if (relayIdx !== -1) {
          syncProgress[relayIdx].status = 'completed';
          syncProgress[relayIdx].eventCount = count;
          syncProgress = [...syncProgress];
        }
      },
      onSyncComplete: () => {
        console.log('[App] Sync complete');
        syncComplete = true;
        syncing = false;
        if (filteredNonEphemeralEvents.length === 0) {
          error = 'No events found for this user in the last 7 days';
        }
        // Auto-collapse after 2 seconds
        setTimeout(() => {
          syncBarCollapsed = true;
        }, 2000);
      },
    };
  });

  // Filter out ephemeral events
  const filteredNonEphemeralEvents = $derived(subscription.events.filter(event => !isEphemeralEvent(event)));

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!nip05Input.trim()) return;

    loading = true;
    error = null;
    user = null;
    connectedRelays = [];
    syncProgress = [];
    syncComplete = false;
    syncing = false;
    syncBarCollapsed = false;
    showResults = false;
    isSubscribed = false;

    try {
      // Resolve NIP-05 identifier
      const resolvedUser = await ndk.fetchUser(nip05Input.trim());

      if (!resolvedUser) {
        error = `Could not resolve NIP-05 identifier: ${nip05Input}`;
        return;
      }

      user = resolvedUser;

      // Fetch the user's relay list (NIP-65)
      const relayList = await getRelayListForUser(resolvedUser.pubkey, ndk);

      // Get user's write relays
      const userRelays = relayList ? relayList.writeRelayUrls : [];

      // Collect all relay URLs that will be used
      const allRelayUrls = new SvelteSet<string>();

      // Add NDK's default relays
      for (const relay of ndk.pool.relays.values()) {
        allRelayUrls.add(relay.url);
      }

      // Add user's relays
      for (const relayUrl of userRelays) {
        allRelayUrls.add(relayUrl);
        ndk.pool.getRelay(relayUrl, true, true);
      }

      connectedRelays = Array.from(allRelayUrls);

      // Initialize sync progress for all relays
      syncProgress = connectedRelays.map(url => ({
        url,
        status: 'pending',
        eventCount: 0,
      }));
      syncing = true;
      loading = false;

      // Start collapsed by default
      syncBarCollapsed = true;

      // Wait for header animation to complete before showing results
      setTimeout(() => {
        showResults = true;
      }, 650);

      // Start the reactive subscription
      isSubscribed = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('Error fetching events:', err);
      loading = false;
      syncing = false;
    }
  }

  async function handleAddRelay(relayUrl: string) {
    if (!user) return;

    // Add the relay to NDK pool
    ndk.pool.getRelay(relayUrl, true, true);

    // Add to connected relays list if not already present
    if (!connectedRelays.includes(relayUrl)) {
      connectedRelays = [...connectedRelays, relayUrl];
      // Subscription will automatically restart due to reactive dependency
    }
  }

  async function handleFetchKind(kind: number) {
    // This feature would require a different subscription or filter approach
    // For now, we'll just log it - the reactive subscription handles all kinds
    console.log(`[App] Fetch kind ${kind} requested - already included in subscription`);
  }
</script>

<div class="container">
  <div class="app-header" class:compact={user !== null}>
    <header>
      <h1>
        <span class="gradient-text">Nostr Event Graph</span>
      </h1>
      {#if !user}
        <p class="subtitle">Visualize event activity by kind over the last 7 days</p>
      {/if}
    </header>

    <form onsubmit={handleSubmit}>
      <input
        type="text"
        bind:value={nip05Input}
        placeholder="Enter NIP-05 (e.g., pablo@nostr.com)"
        disabled={loading}
      />
      <button type="submit" disabled={loading || !nip05Input.trim()}>
        {loading ? 'Loading...' : 'Visualize'}
      </button>
    </form>
  </div>

  {#if error}
    <div class="error">
      <span>⚠️</span>
      <p>{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Fetching events from the nostrverse...</p>
    </div>
  {/if}

  {#if showResults}
    {#if syncing || syncComplete}
      <div class="sync-progress-container" class:collapsed={syncBarCollapsed}>
        <div class="sync-header" onclick={() => syncBarCollapsed = !syncBarCollapsed}>
          <h3>
            {#if syncComplete}
              ✅ Sync Complete
            {:else}
              ⚡ Syncing Relays
            {/if}
          </h3>
          <div class="sync-stats">
            <span class="sync-stat">
              {syncProgress.filter(r => r.status === 'completed').length} / {syncProgress.length} relays
            </span>
            <span class="sync-stat">
              {filteredNonEphemeralEvents.length} events
            </span>
            <button class="collapse-btn" aria-label={syncBarCollapsed ? 'Expand' : 'Collapse'}>
              {syncBarCollapsed ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {#if !syncComplete}
          <div class="sync-progress-bar">
            <div
              class="sync-progress-fill"
              style:width="{(syncProgress.filter(r => r.status === 'completed').length / syncProgress.length) * 100}%"
            ></div>
          </div>
        {/if}

        {#if !syncBarCollapsed}
          <div class="relay-progress-list">
            {#each syncProgress as relay}
              <div class="relay-progress-item" class:completed={relay.status === 'completed'}>
                <div class="relay-progress-info">
                  <div class="relay-progress-indicator">
                    {#if relay.status === 'completed'}
                      <span class="status-icon completed">✓</span>
                    {:else if relay.status === 'syncing'}
                      <span class="status-icon syncing">⏳</span>
                    {:else}
                      <span class="status-icon pending">○</span>
                    {/if}
                  </div>
                  <span class="relay-progress-url">{relay.url.replace(/^wss?:\/\//, '')}</span>
                </div>
                {#if relay.status === 'completed'}
                  <span class="relay-progress-count">{relay.eventCount} events</span>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if user && filteredNonEphemeralEvents.length > 0}
      <EventGraph {ndk} events={filteredNonEphemeralEvents} {user} {connectedRelays} onAddRelay={handleAddRelay} onFetchKind={handleFetchKind} />
    {/if}
  {/if}
</div>

<style>
  .container {
    max-width: 1400px;
    width: 100%;
  }

  .app-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-header.compact {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  header {
    text-align: center;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-header.compact header {
    text-align: left;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-header.compact h1 {
    font-size: 1.5rem;
    margin-bottom: 0;
    white-space: nowrap;
  }

  .gradient-text {
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #6366f1 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }

  .subtitle {
    font-size: 1.25rem;
    color: rgba(224, 230, 237, 0.7);
    font-weight: 400;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  form {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
  }

  .app-header.compact form {
    flex: 1;
    flex-wrap: nowrap;
    gap: 0.75rem;
  }

  input {
    flex: 1;
    min-width: 300px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-header.compact input {
    min-width: 200px;
    flex: 1;
  }

  button {
    min-width: 150px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-header.compact button {
    min-width: 100px;
    flex-shrink: 0;
  }

  .error {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
  }

  .error span {
    font-size: 1.5rem;
  }

  .error p {
    color: #fca5a5;
    margin: 0;
    font-weight: 500;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(139, 92, 246, 0.1);
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-container p {
    color: rgba(224, 230, 237, 0.7);
    font-size: 1.125rem;
  }

  .sync-progress-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .sync-progress-container.collapsed {
    padding: 0.75rem 1.5rem;
  }

  .sync-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sync-progress-container.collapsed .sync-header {
    margin-bottom: 0;
  }

  .sync-header:hover {
    opacity: 0.8;
  }

  .sync-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(224, 230, 237, 0.9);
    margin: 0;
  }

  .sync-stats {
    display: flex;
    gap: 1.5rem;
  }

  .sync-stat {
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.7);
    font-weight: 500;
  }

  .collapse-btn {
    background: none;
    border: none;
    color: rgba(224, 230, 237, 0.7);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }

  .collapse-btn:hover {
    color: rgba(224, 230, 237, 1);
    background: rgba(139, 92, 246, 0.1);
  }

  .relay-progress-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .relay-progress-list::-webkit-scrollbar {
    width: 6px;
  }

  .relay-progress-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .relay-progress-list::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 3px;
  }

  .relay-progress-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .relay-progress-item.completed {
    background: rgba(139, 92, 246, 0.05);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .relay-progress-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .relay-progress-indicator {
    flex-shrink: 0;
  }

  .status-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    font-size: 0.875rem;
  }

  .status-icon.completed {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .status-icon.syncing {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .status-icon.pending {
    color: rgba(224, 230, 237, 0.3);
  }

  .relay-progress-url {
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relay-progress-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(139, 92, 246, 0.9);
    background: rgba(139, 92, 246, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    flex-shrink: 0;
  }

  .sync-progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 1rem;
  }

  .sync-progress-container.collapsed .sync-progress-bar {
    margin-top: 0.75rem;
  }

  .sync-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .app-header.compact {
      flex-direction: column;
      align-items: stretch;
    }

    .app-header.compact header {
      text-align: center;
    }

    .app-header.compact form {
      width: 100%;
    }

    .app-header.compact input {
      min-width: unset;
      flex: 1;
    }

    h1 {
      font-size: 2.5rem;
    }

    .app-header.compact h1 {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    form {
      flex-direction: column;
    }

    input {
      width: 100%;
      min-width: unset;
    }

    .sync-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .sync-stats {
      width: 100%;
      justify-content: space-between;
    }

    .relay-progress-list {
      max-height: 200px;
    }
  }
</style>
