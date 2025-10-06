<script lang="ts">
  import { onDestroy } from "svelte"
  import { NDKSvelte } from "@nostr-dev-kit/svelte"
  import SigVerifyWorker from './sig-verify.worker.ts?worker'

  // Initialize the signature verification worker
  const sigVerifyWorker = new SigVerifyWorker()

  // Initialize NDK with signature verification sampling
  const ndk = new NDKSvelte({
    explicitRelayUrls: [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band'
    ],
    signatureVerificationWorker: sigVerifyWorker,
    initialValidationRatio: 1.0,     // Start by validating 100% of events
    lowestValidationRatio: 0.1,      // Eventually validate 10% of events
    cacheAdapter: undefined,         // Disable cache completely
  })

  // Track invalid signatures
  let invalidSigCount = $state(0)
  let lastInvalidEvent = $state<any>(null)

  ndk.on('event:invalid-sig', (event, relay) => {
    invalidSigCount++
    lastInvalidEvent = {
      id: event.id,
      pubkey: event.pubkey,
      relay: relay?.url,
      timestamp: new Date().toLocaleTimeString()
    }
    console.error('Invalid signature detected:', event.id, 'from', relay?.url)
  })

  // Connect to relays
  ndk.connect()

  // Subscribe to recent notes
  const notes = ndk.subscribe(() => ({
    kinds: [1],
    limit: 50
  }), {
    cacheUsage: 0 // NDKSubscriptionCacheUsage.ONLY_RELAY - don't use cache
  })

  // Track relay stats
  let relayStats = $state<Map<string, any>>(new Map())

  // Update relay validation stats periodically to pick up changes
  setInterval(() => {
    const stats = new Map()
    for (const relay of ndk.pool.relays.values()) {
      stats.set(relay.url, {
        url: relay.url,
        validatedCount: relay.validatedEventCount,
        nonValidatedCount: relay.nonValidatedEventCount,
        targetRatio: relay.targetValidationRatio.toFixed(3),
        trusted: relay.trusted
      })
    }
    relayStats = stats
  }, 100)

  onDestroy(() => {
    notes.stop()
    sigVerifyWorker.terminate()
  })
</script>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .header {
    margin-bottom: 30px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }
  .stat-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
  }
  .stat-label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #333;
  }
  .stat-value.danger {
    color: #d32f2f;
  }
  .relay-stats {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
  }
  .relay-stats h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  .relay-table {
    width: 100%;
    border-collapse: collapse;
  }
  .relay-table th {
    text-align: left;
    padding: 12px;
    border-bottom: 2px solid #e0e0e0;
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .relay-table td {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  .relay-url {
    font-family: monospace;
    font-size: 13px;
  }
  .notes-section {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
  }
  .notes-section h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  .note {
    padding: 15px;
    margin-bottom: 10px;
    background: #f9f9f9;
    border-radius: 6px;
  }
  .note-author {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    font-family: monospace;
  }
  .note-content {
    color: #333;
    line-height: 1.5;
    word-wrap: break-word;
  }
  .invalid-sig-alert {
    background: #ffebee;
    border: 1px solid #ef5350;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }
  .invalid-sig-alert h3 {
    margin-top: 0;
    color: #d32f2f;
  }
  .invalid-sig-details {
    font-family: monospace;
    font-size: 12px;
    color: #666;
  }
  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge.trusted {
    background: #e8f5e9;
    color: #2e7d32;
  }
  .info-box {
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }
  .info-box h3 {
    margin-top: 0;
    color: #1976d2;
  }
</style>

<div class="container">
  <div class="header">
    <h1>Signature Verification Demo</h1>
    <p>Demonstrating NDK's adaptive signature verification sampling with web workers</p>
  </div>

  <div class="info-box">
    <h3>How it works</h3>
    <p>
      This demo uses a web worker to verify event signatures asynchronously. It starts by validating 100% of events,
      then gradually reduces the validation ratio to 10% as trust builds with each relay. Invalid signatures trigger
      an alert and the relay's validation ratio increases.
    </p>
  </div>

  {#if lastInvalidEvent}
    <div class="invalid-sig-alert">
      <h3>⚠️ Invalid Signature Detected</h3>
      <div class="invalid-sig-details">
        <div>Event ID: {lastInvalidEvent.id}</div>
        <div>Pubkey: {lastInvalidEvent.pubkey}</div>
        <div>Relay: {lastInvalidEvent.relay}</div>
        <div>Time: {lastInvalidEvent.timestamp}</div>
      </div>
    </div>
  {/if}

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Events Received</div>
      <div class="stat-value">{notes.count}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Invalid Signatures</div>
      <div class="stat-value danger">{invalidSigCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Connected Relays</div>
      <div class="stat-value">{ndk.poolStats.connectedCount}/{ndk.pool.relays.size}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Verification Time</div>
      <div class="stat-value">{ndk.signatureVerificationTimeMs}ms</div>
    </div>
  </div>

  <div class="relay-stats">
    <h2>Relay Verification Stats</h2>
    <table class="relay-table">
      <thead>
        <tr>
          <th>Relay</th>
          <th>Validated</th>
          <th>Not Validated</th>
          <th>Target Ratio</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each Array.from(relayStats.values()) as stat}
          <tr>
            <td class="relay-url">{stat.url}</td>
            <td>{stat.validatedCount}</td>
            <td>{stat.nonValidatedCount}</td>
            <td>{stat.targetRatio}</td>
            <td>
              {#if stat.trusted}
                <span class="badge trusted">Trusted</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="notes-section">
    <h2>Recent Notes ({notes.count})</h2>
    {#each notes.events.slice(0, 10) as note}
      <div class="note">
        <div class="note-author">
          {note.pubkey.slice(0, 16)}...
        </div>
        <div class="note-content">
          {note.content || '(empty)'}
        </div>
      </div>
    {/each}
  </div>
</div>
