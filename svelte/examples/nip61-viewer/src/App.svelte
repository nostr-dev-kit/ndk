<script lang="ts">
  import { ndk, ndkReady } from './lib/ndk';
  import { NDKNip07Signer, type NDKEvent } from '@nostr-dev-kit/ndk';
  import type { EventSubscription } from '@nostr-dev-kit/svelte';

  type EventKind = 10019 | 10002;

  let nip05Input = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let subscription = $state<EventSubscription<NDKEvent> | null>(null);
  let ready = $state(false);
  let selectedKind = $state<EventKind>(10019);

  const eventKinds: { value: EventKind; label: string; description: string }[] = [
    { value: 10019, label: 'NIP-61 Wallet Config', description: 'Cashu wallet configuration (mints, relays, p2pk)' },
    { value: 10002, label: 'NIP-65 Relay List', description: 'User relay list metadata' }
  ];

  // Wait for NDK to be ready
  ndkReady.then(() => {
    ready = true;
  });

  async function lookupNip05() {
    if (!nip05Input.trim()) return;

    loading = true;
    error = null;
    subscription = null;

    try {
      const user = await ndk.fetchUser(nip05Input.trim());

      if (!user) {
        error = 'NIP-05 not found or invalid';
        return;
      }

      subscribeToEvent(user.pubkey);

    } catch (e) {
      error = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }

  async function login() {
    loading = true;
    error = null;
    subscription = null;

    try {
      const signer = new NDKNip07Signer();
      await ndk.sessions.login(signer);

      const currentSession = ndk.sessions.current;
      if (!currentSession) {
        error = 'Failed to login. Please install a NIP-07 extension like Alby or nos2x.';
        return;
      }

      subscribeToEvent(currentSession.pubkey);

    } catch (e) {
      error = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }

  function subscribeToEvent(pubkey: string) {
    console.log('[App] Creating subscription for pubkey:', pubkey, 'kind:', selectedKind);

    // Subscribe to the selected event kind - events and eosed are reactive properties
    subscription = ndk.subscribe([
      {
        kinds: [selectedKind],
        authors: [pubkey]
      }
    ], {
      onEvent: (event) => {
        console.log('[App] Event received:', event.kind, event.id, 'Total events:', subscription?.events.length);
      },
      onEose: () => {
        console.log('[App] EOSE received, events:', subscription?.events.length);
      }
    });

    console.log('[App] Subscription created');
  }

  function parseEvent(event: NDKEvent) {
    if (event.kind === 10019) {
      // NIP-61 Wallet Config
      const mints: string[] = [];
      const relays: string[] = [];
      let p2pk: string | null = null;

      for (const tag of event.tags) {
        if (tag[0] === 'mint') {
          mints.push(tag[1]);
        } else if (tag[0] === 'relay') {
          relays.push(tag[1]);
        } else if (tag[0] === 'p2pk' || tag[0] === 'pubkey') {
          p2pk = tag[1];
        }
      }

      return { type: 'wallet' as const, mints, relays, p2pk };
    } else if (event.kind === 10002) {
      // NIP-65 Relay List
      const readRelays: string[] = [];
      const writeRelays: string[] = [];
      const bothRelays: string[] = [];

      for (const tag of event.tags) {
        if (tag[0] === 'r') {
          const url = tag[1];
          const marker = tag[2];

          if (!marker) {
            bothRelays.push(url);
          } else if (marker === 'read') {
            readRelays.push(url);
          } else if (marker === 'write') {
            writeRelays.push(url);
          }
        }
      }

      return { type: 'relaylist' as const, readRelays, writeRelays, bothRelays };
    }

    return { type: 'unknown' as const };
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      lookupNip05();
    }
  }
</script>

<main>
  <header>
    <h1>Nostr Event Viewer</h1>
    <p>View user events with reactive subscriptions</p>
  </header>

  {#if !ready}
    <div class="loading-state">
      <p>Connecting to Nostr...</p>
    </div>
  {:else}
    <div class="controls">
      <div class="kind-selector">
        <label for="kind-select">Event Kind:</label>
        <select id="kind-select" bind:value={selectedKind} disabled={loading}>
          {#each eventKinds as kind}
            <option value={kind.value}>
              {kind.label}
            </option>
          {/each}
        </select>
        <p class="kind-description">
          {eventKinds.find(k => k.value === selectedKind)?.description}
        </p>
      </div>

      <div class="input-group">
        <input
          type="text"
          bind:value={nip05Input}
          placeholder="Enter NIP-05 (e.g., user@domain.com)"
          onkeypress={handleKeyPress}
          disabled={loading}
        />
        <button onclick={lookupNip05} disabled={loading || !nip05Input.trim()}>
          {loading ? 'Loading...' : 'Lookup'}
        </button>
      </div>

      <div class="separator">or</div>

      <button onclick={login} disabled={loading} class="login-btn">
        {loading ? 'Loading...' : 'Login & View My Events'}
      </button>
    </div>

    {#if error}
      <div class="error">
        {error}
      </div>
    {/if}

    {#if subscription && subscription.events.length === 0 && subscription.eosed}
      <div class="error">
        No event found for this user (kind {selectedKind})
      </div>
    {/if}

    {#if subscription && subscription.events.length > 0}
      {@const event = subscription.events[0]}
      {@const parsedData = parseEvent(event)}
      <div class="config">
        <h2>{selectedKind === 10019 ? 'Wallet Configuration' : 'Relay List'}</h2>

        <div class="config-section">
          <h3>Event Info</h3>
          <div class="info-item">
            <span class="label">Kind:</span>
            <code>{event.kind}</code>
          </div>
          <div class="info-item">
            <span class="label">Pubkey:</span>
            <code>{event.pubkey}</code>
          </div>
          <div class="info-item">
            <span class="label">Created:</span>
            <span>{new Date((event.created_at || 0) * 1000).toLocaleString()}</span>
          </div>
          <div class="info-item">
            <span class="label">Event ID:</span>
            <code>{event.id}</code>
          </div>
        </div>

        {#if parsedData.type === 'wallet'}
          {#if parsedData.mints.length > 0}
            <div class="config-section">
              <h3>Mints ({parsedData.mints.length})</h3>
              <ul>
                {#each parsedData.mints as mint}
                  <li><code>{mint}</code></li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if parsedData.relays.length > 0}
            <div class="config-section">
              <h3>Relays ({parsedData.relays.length})</h3>
              <ul>
                {#each parsedData.relays as relay}
                  <li><code>{relay}</code></li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if parsedData.p2pk}
            <div class="config-section">
              <h3>P2PK (Pay-to-Public-Key)</h3>
              <code>{parsedData.p2pk}</code>
            </div>
          {/if}
        {:else if parsedData.type === 'relaylist'}
          {#if parsedData.bothRelays.length > 0}
            <div class="config-section">
              <h3>Read & Write Relays ({parsedData.bothRelays.length})</h3>
              <ul>
                {#each parsedData.bothRelays as relay}
                  <li><code>{relay}</code></li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if parsedData.readRelays.length > 0}
            <div class="config-section">
              <h3>Read-Only Relays ({parsedData.readRelays.length})</h3>
              <ul>
                {#each parsedData.readRelays as relay}
                  <li><code>{relay}</code></li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if parsedData.writeRelays.length > 0}
            <div class="config-section">
              <h3>Write-Only Relays ({parsedData.writeRelays.length})</h3>
              <ul>
                {#each parsedData.writeRelays as relay}
                  <li><code>{relay}</code></li>
                {/each}
              </ul>
            </div>
          {/if}
        {/if}

        <details class="raw-event">
          <summary>Raw Event JSON</summary>
          <pre>{JSON.stringify(event.rawEvent(), null, 2)}</pre>
        </details>
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    margin: 0;
    color: #333;
  }

  header p {
    color: #666;
    margin-top: 0.5rem;
  }

  .loading-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .kind-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .kind-selector label {
    font-weight: 500;
    color: #555;
  }

  .kind-selector select {
    padding: 0.6em;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1em;
    background-color: white;
  }

  .kind-selector select:focus {
    outline: 2px solid #646cff;
    border-color: #646cff;
  }

  .kind-description {
    margin: 0;
    font-size: 0.9em;
    color: #666;
    font-style: italic;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
  }

  .input-group input {
    flex: 1;
  }

  .separator {
    text-align: center;
    color: #999;
    font-weight: 500;
  }

  .login-btn {
    background-color: #646cff;
    color: white;
  }

  .login-btn:hover:not(:disabled) {
    background-color: #535bf2;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .config {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .config h2 {
    margin-top: 0;
    color: #333;
  }

  .config-section {
    margin-bottom: 1.5rem;
  }

  .config-section:last-child {
    margin-bottom: 0;
  }

  .config-section h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    color: #555;
    font-size: 1.1rem;
  }

  .info-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    align-items: baseline;
  }

  .label {
    font-weight: 500;
    min-width: 80px;
  }

  code {
    background-color: #eee;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9em;
    word-break: break-all;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  .raw-event {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #ddd;
  }

  .raw-event summary {
    cursor: pointer;
    font-weight: 500;
    color: #555;
    user-select: none;
  }

  .raw-event summary:hover {
    color: #333;
  }

  pre {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.4;
  }
</style>
