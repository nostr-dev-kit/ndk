<script lang="ts">
  import { ndk } from './lib/ndk';
  import type { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';
  import { getRelayListForUser } from '@nostr-dev-kit/ndk';
  import EventGraph from './EventGraph.svelte';

  console.log('[App] Component loaded');

  let nip05Input = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let user = $state<NDKUser | null>(null);
  let events = $state<NDKEvent[]>([]);
  let connectedRelays = $state<string[]>([]);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!nip05Input.trim()) return;

    loading = true;
    error = null;
    user = null;
    events = [];
    connectedRelays = [];

    try {
      // Resolve NIP-05 identifier
      const resolvedUser = await ndk.getUserFromNip05(nip05Input.trim());

      if (!resolvedUser) {
        error = `Could not resolve NIP-05 identifier: ${nip05Input}`;
        return;
      }

      user = resolvedUser;

      // Fetch the user's relay list (NIP-65)
      const relayList = await getRelayListForUser(resolvedUser.pubkey, ndk);
      console.log('[App] User relay list:', relayList);

      // Get user's write relays
      const userRelays = relayList ? relayList.writeRelayUrls : [];
      console.log('[App] User write relays:', userRelays);

      // Collect all relay URLs that will be used
      const allRelayUrls = new Set<string>();

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

      // Fetch events from the last 7 days
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

      const fetchedEvents = await ndk.fetchEvents({
        authors: [resolvedUser.pubkey],
        since: sevenDaysAgo,
      });

      events = Array.from(fetchedEvents);

      if (events.length === 0) {
        error = 'No events found for this user in the last 7 days';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('Error fetching events:', err);
    } finally {
      loading = false;
    }
  }

  async function handleAddRelay(relayUrl: string) {
    if (!user) return;

    // Add the relay to NDK pool
    ndk.pool.getRelay(relayUrl, true, true);

    // Add to connected relays list if not already present
    if (!connectedRelays.includes(relayUrl)) {
      connectedRelays = [...connectedRelays, relayUrl];
    }

    // Re-fetch events from all relays including the new one
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

    const fetchedEvents = await ndk.fetchEvents({
      authors: [user.pubkey],
      since: sevenDaysAgo,
    });

    events = Array.from(fetchedEvents);
  }

  async function handleFetchKind(kind: number) {
    if (!user) return;

    // Fetch events for specific kind from the last 7 days
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

    const fetchedEvents = await ndk.fetchEvents({
      authors: [user.pubkey],
      kinds: [kind],
      since: sevenDaysAgo,
    });

    // Merge new events with existing events, avoiding duplicates
    const existingIds = new Set(events.map(e => e.id));
    const newEvents = Array.from(fetchedEvents).filter(e => !existingIds.has(e.id));

    events = [...events, ...newEvents];
  }
</script>

<div class="container">
  <header>
    <h1>
      <span class="gradient-text">Nostr Event Graph</span>
    </h1>
    <p class="subtitle">Visualize event activity by kind over the last 7 days</p>
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

  {#if user && events.length > 0}
    <EventGraph {events} {user} {connectedRelays} onAddRelay={handleAddRelay} onFetchKind={handleFetchKind} />
  {/if}
</div>

<style>
  .container {
    max-width: 1400px;
    width: 100%;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
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
  }

  form {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  input {
    flex: 1;
    min-width: 300px;
  }

  button {
    min-width: 150px;
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

  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
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
  }
</style>
