<script lang="ts">
  import { ndk } from './lib/ndk';
  import { SvelteSet } from 'svelte/reactivity';

  const DEFAULT_RELAYS = [
    'wss://relay.nostr.band',
    'wss://f7z.io',
  ];

  let selectedRelayUrls = new SvelteSet(DEFAULT_RELAYS);
  let availableRelays = $state<string[]>([...DEFAULT_RELAYS]);
  let newRelayUrl = $state<string>('');
  let debugLogs = $state<string[]>([]);
  let isSubscribed = $state(false);

  function addDebugLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    debugLogs = [`[${timestamp}] ${message}`, ...debugLogs].slice(0, 50);
  }

  function addRelay() {
    const url = newRelayUrl.trim();
    if (!url) return;

    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      addDebugLog(`❌ Invalid relay URL: ${url}`);
      return;
    }

    if (availableRelays.includes(url)) {
      addDebugLog(`⚠️ Relay already in list: ${url}`);
      return;
    }

    availableRelays = [...availableRelays, url];
    addDebugLog(`➕ Added relay: ${url}`);
    newRelayUrl = '';
  }

  function toggleRelay(relayUrl: string) {
    if (selectedRelayUrls.has(relayUrl)) {
      selectedRelayUrls.delete(relayUrl);
    } else {
      selectedRelayUrls.add(relayUrl);
    }
    addDebugLog(`🔄 Selected relays: ${Array.from(selectedRelayUrls).join(', ')}`);
  }

  function subscribe() {
    if (selectedRelayUrls.size === 0) {
      addDebugLog('❌ No relays selected');
      return;
    }

    const relays = Array.from(selectedRelayUrls);
    isSubscribed = true;
    addDebugLog(`🔔 Subscribing to ${relays.length} relay(s): ${relays.join(', ')}`);
  }

  // Use NDK's reactive pool store to track connections
  const getRelayStatus = $derived.by(() => {
    const statusMap = new Map<string, string>();
    for (const relay of ndk.$pool.relays.values()) {
      // Store both with and without trailing slash to handle URL normalization
      statusMap.set(relay.url, relay.status);
      const urlWithoutSlash = relay.url.endsWith('/') ? relay.url.slice(0, -1) : relay.url;
      statusMap.set(urlWithoutSlash, relay.status);
    }
    return statusMap;
  });

  // Create reactive subscription that automatically restarts when dependencies change
  const notes = ndk.$subscribe(() => {
    if (!isSubscribed) return undefined;
    if (selectedRelayUrls.size === 0) return undefined;

    return {
      filters: [{ kinds: [1], limit: 1 }],
      relayUrls: Array.from(selectedRelayUrls),
      closeOnEose: false,
    };
  });

  // Filter events to only show past/present events, not future ones
  // Take the first non-future event (should be most recent if NDK sorts correctly)
  const currentEvent = $derived.by(() => {
    const now = Math.floor(Date.now() / 1000);
    return notes.events.find(event => (event.created_at || 0) <= now);
  });
</script>

<main>
  <div class="app-header">
    <h1>📡 NDK Feed Viewer</h1>
    <p class="subtitle">Debug Tool for Nostr Event Streams</p>
  </div>

  <div class="container">
    <div class="controls">
      <div class="relay-section">
        <h2>Relay Selection</h2>

        <div class="relay-list">
          {#each availableRelays as relay (relay)}
            {@const status = getRelayStatus.get(relay)}
            <label class="relay-item">
              <input
                type="checkbox"
                checked={selectedRelayUrls.has(relay)}
                onchange={() => toggleRelay(relay)}
              />
              <span class="relay-url">{relay}</span>
              {#if status === 'connected'}
                <span class="status connected">🟢 Connected</span>
              {:else if status === 'connecting'}
                <span class="status connecting">🟡 Connecting</span>
              {:else if status === 'reconnecting'}
                <span class="status reconnecting">🟡 Reconnecting</span>
              {:else}
                <span class="status disconnected">🔴 Disconnected</span>
              {/if}
            </label>
          {/each}
        </div>

        <div class="add-relay">
          <input
            type="text"
            bind:value={newRelayUrl}
            placeholder="wss://relay.example.com"
            onkeydown={(e) => e.key === 'Enter' && addRelay()}
          />
          <button onclick={addRelay}>Add Relay</button>
        </div>

        <div class="subscribe-controls">
          <button class="subscribe-btn" onclick={subscribe} disabled={selectedRelayUrls.size === 0}>
            🔔 Subscribe to Selected Relays
          </button>
        </div>
      </div>

      <div class="event-section">
        <h2>Latest Event (kind:1)</h2>
        {notes.events.length}
        {#if currentEvent}
          {@const event = currentEvent}
          <div class="event-card">
            <div class="event-meta">
              <div class="meta-item">
                <span class="meta-label">Event ID:</span>
                <code>{event.id}</code>
              </div>
              <div class="meta-item">
                <span class="meta-label">Relays:</span>
                <code>{event.onRelays?.map(r => r.url).join(', ') || 'unknown'}</code>
              </div>
              <div class="meta-item">
                <span class="meta-label">Author:</span>
                <code>{event.pubkey.slice(0, 16)}...</code>
              </div>
              <div class="meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">{new Date((event.created_at || 0) * 1000).toLocaleString()}</span>
              </div>
            </div>
            <div class="event-content">
              <span class="content-label">Content:</span>
              <div class="content-text">{event.content}</div>
            </div>
          </div>
        {:else}
          <div class="no-event">
            <p>Waiting for events...</p>
            {#if !isSubscribed}
              <p class="hint">
                {#if selectedRelayUrls.size === 0}
                  Select at least one relay and click Subscribe to start receiving events
                {:else}
                  Click Subscribe to start receiving events from selected relays
                {/if}
              </p>
            {/if}
          </div>
        {/if}
      </div>

      <div class="debug-section">
        <h2>Debug Info</h2>
        <div class="debug-stats">
          <div class="stat">
            <strong>Selected Relays:</strong> {selectedRelayUrls.size}
          </div>
          <div class="stat">
            <strong>Connected:</strong> {ndk.$pool.connectedCount} / {ndk.$pool.relays.size}
          </div>
          <div class="stat">
            <strong>Events:</strong> {notes.count}
          </div>
          <div class="stat">
            <strong>EOSED:</strong> {notes.eosed ? 'Yes' : 'No'}
          </div>
        </div>
        <div class="debug-log">
          <pre>{debugLogs.join('\n') || 'No debug messages yet...'}</pre>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Helvetica Neue',
      sans-serif;
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    text-align: center;
    padding: 2rem 2rem 1rem;
    color: white;
  }

  .app-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .subtitle {
    margin: 0;
    font-size: 1.125rem;
    opacity: 0.95;
    font-weight: 400;
  }

  .container {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1rem 2rem 2rem;
  }

  .controls {
    display: grid;
    gap: 1.5rem;
  }

  .relay-section,
  .event-section,
  .debug-section {
    background: white;
    color: black;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    color: #111827;
  }

  .relay-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .relay-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .relay-item:hover {
    background: #f3f4f6;
  }

  .relay-item input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .relay-url {
    flex: 1;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    color: #374151;
  }

  .status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
  }

  .status.connected {
    background: #d1fae5;
    color: #065f46;
  }

  .status.connecting,
  .status.reconnecting {
    background: #fef3c7;
    color: #92400e;
  }

  .status.disconnected {
    background: #fee2e2;
    color: #991b1b;
  }

  .add-relay {
    display: flex;
    gap: 0.5rem;
  }

  .add-relay input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  .add-relay input:focus {
    outline: none;
    border-color: #667eea;
  }

  .add-relay button {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .add-relay button:hover {
    background: #5568d3;
  }

  .subscribe-controls {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .subscribe-btn {
    width: 100%;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
    background: #10b981;
    color: white;
  }

  .subscribe-btn:hover:not(:disabled) {
    background: #059669;
  }

  .subscribe-btn:disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .event-card {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .event-meta {
    display: grid;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .meta-item {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    font-size: 0.875rem;
  }

  .meta-label {
    color: #6b7280;
    min-width: 100px;
    font-weight: 600;
  }

  .meta-value {
    color: #111827;
  }

  .meta-item code {
    font-family: 'Monaco', 'Courier New', monospace;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    word-break: break-all;
    color: #111827;
  }

  .event-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .content-label {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .content-text {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #111827;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .no-event {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
  }

  .no-event p {
    margin: 0.5rem 0;
  }

  .hint {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .debug-stats {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .stat {
    font-size: 0.875rem;
    color: #111827;
  }

  .stat strong {
    color: #6b7280;
  }

  .debug-log {
    background: #1f2937;
    border-radius: 8px;
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .debug-log pre {
    margin: 0;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
    color: #10b981;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  @media (max-width: 768px) {
    .app-header h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .container {
      padding: 1rem;
    }

    .debug-stats {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
