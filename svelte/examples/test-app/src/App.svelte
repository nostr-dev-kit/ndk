<script lang="ts">
  import { onDestroy } from "svelte"
  import { NDKSvelte } from "@nostr-dev-kit/svelte"
  import { useUser } from "@nostr-dev-kit/svelte"

  // Initialize NDK with reactive stores
  const ndk = new NDKSvelte({
    explicitRelayUrls: [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band'
    ]
  })

  // Connect to relays
  ndk.connect()

  // Simple hash-based routing
  let route = $state(window.location.hash.slice(1) || '/')
  let params = $state<{ identifier?: string }>({})

  function updateRoute() {
    const hash = window.location.hash.slice(1) || '/'
    const match = hash.match(/^\/p\/(.+)$/)

    if (match) {
      route = '/p/:identifier'
      params = { identifier: match[1] }
    } else {
      route = '/'
      params = {}
    }
  }

  $effect(() => {
    updateRoute()
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  })

  // Reactive filter state
  let noteLimit = $state(20)

  // Subscribe to recent notes with reactive filters
  const notes = ndk.subscribe(() => ({
    kinds: [1],
    limit: noteLimit
  }))

  $effect(() => {
    console.log('Notes:', notes.count, 'EOSE:', notes.eosed)
  })

  onDestroy(() => {
    notes.stop()
  })

  function handleClear() {
    notes.clear()
    notes.start()
  }
</script>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .stats {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  .stat {
    display: flex;
    flex-direction: column;
  }
  .stat-label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
  }
  .controls label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  button, select {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  button:hover, select:hover {
    background: #f5f5f5;
    border-color: #999;
  }
  .note {
    padding: 15px;
    margin-bottom: 10px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
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
  .note-time {
    font-size: 11px;
    color: #999;
    margin-top: 8px;
  }
  .nav {
    margin-bottom: 20px;
  }
  .nav a {
    color: #0066cc;
    text-decoration: none;
  }
  .nav a:hover {
    text-decoration: underline;
  }
  .profile {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
  }
  .profile-field {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
  }
  .profile-field:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .profile-field .label {
    font-weight: 600;
    color: #666;
    min-width: 120px;
  }
  .profile-field .value {
    color: #333;
    word-wrap: break-word;
    flex: 1;
  }
</style>

<div class="container">
  {#if route === '/'}
    <h1>Live Nostr Feed</h1>
    <div class="nav">
      <a href="#/p/npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft">Test Profile (npub)</a>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">Notes</span>
        <span class="stat-value">{notes.count}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Status</span>
        <span class="stat-value">{notes.eosed ? '✓ Loaded' : '⏳ Loading'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Relays</span>
        <span class="stat-value">{ndk.poolStats.connectedCount}/{ndk.pool.relays.size}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Connecting</span>
        <span class="stat-value">{ndk.poolStats.connectingCount}</span>
      </div>
    </div>

    <div class="controls">
      <button onclick={handleClear}>Clear & Reload</button>
      <button onclick={() => notes.stop()}>Stop</button>
      <button onclick={() => notes.start()}>Start</button>
      <label>
        Limit:
        <select bind:value={noteLimit}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
    </div>

    {#each notes.events as note}
      <div class="note">
        <div class="note-author">
          {note.pubkey.slice(0, 16)}...
        </div>
        <div class="note-content">
          {note.content || '(empty)'}
        </div>
        <div class="note-time">
          {new Date((note.created_at || 0) * 1000).toLocaleString()}
        </div>
      </div>
    {/each}
  {:else if route === '/p/:identifier' && params.identifier}
    {@const user = useUser(ndk, params.identifier)}
    {@const userNotes = user.pubkey ? ndk.subscribe({
      kinds: [1],
      authors: [user.pubkey],
      limit: 1
    }) : null}

    <h1>User Profile</h1>
    <div class="nav">
      <a href="#/">← Back to Feed</a>
    </div>

    <div class="profile">
      <div class="profile-field">
        <span class="label">Identifier:</span>
        <span class="value">{params.identifier}</span>
      </div>
      <div class="profile-field">
        <span class="label">Pubkey:</span>
        <span class="value">{user.pubkey || 'Loading...'}</span>
      </div>
      <div class="profile-field">
        <span class="label">Npub:</span>
        <span class="value">{user.npub || 'Loading...'}</span>
      </div>
      <div class="profile-field">
        <span class="label">Name:</span>
        <span class="value">{user.profile?.name || 'Loading...'}</span>
      </div>
      <div class="profile-field">
        <span class="label">Display Name:</span>
        <span class="value">{user.profile?.displayName || user.profile?.display_name || '-'}</span>
      </div>
      <div class="profile-field">
        <span class="label">About:</span>
        <span class="value">{user.profile?.about || '-'}</span>
      </div>
    </div>

    {#if userNotes?.latest}
      <h2>Latest Note</h2>
      <div class="note">
        <div class="note-content">
          {userNotes.latest.content || '(empty)'}
        </div>
        <div class="note-time">
          {new Date((userNotes.latest.created_at || 0) * 1000).toLocaleString()}
        </div>
      </div>
    {/if}
  {/if}
</div>
