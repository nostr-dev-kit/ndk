<script lang="ts">
  import { ndk } from './lib/ndk';
  import { NDKWoT, filterByWoT, rankByWoT } from '@nostr-dev-kit/wot';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';

  // Default npub as requested
  const DEFAULT_NPUB = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';

  let npubInput = $state(DEFAULT_NPUB);
  let rootPubkey = $state('');
  let wot: NDKWoT | null = $state(null);
  let isLoading = $state(false);
  let wotStatus = $state('');
  let wotDepth = $state(2);
  let maxDepthFilter = $state(2);
  let rankingAlgorithm = $state<'distance' | 'score' | 'followers'>('distance');
  let includeUnknown = $state(false);

  // Subscribe to kind:1 events
  const sub = ndk.$subscribe(() => [
    {
      kinds: [1],
      limit: 100
    }
  ]);

  // Filtered and ranked events based on WOT
  const filteredEvents = $derived.by(() => {
    if (!wot || !wot.isLoaded()) return sub.events;

    const filtered = filterByWoT(wot, sub.events, {
      maxDepth: maxDepthFilter,
      includeUnknown
    });

    return rankByWoT(wot, filtered, {
      algorithm: rankingAlgorithm,
      unknownsLast: true
    });
  });

  // WOT stats
  const wotStats = $derived.by(() => {
    if (!wot || !wot.isLoaded()) return null;

    const total = sub.events.length;
    const inWoT = filteredEvents.filter(e => wot.includes(e.pubkey)).length;
    const unknown = filteredEvents.length - inWoT;

    return {
      total,
      inWoT,
      unknown,
      networkSize: wot.size
    };
  });

  async function loadWoT() {
    try {
      isLoading = true;
      wotStatus = 'Parsing user identifier...';

      // Parse input to support npub, nprofile, hex pubkey
      let pubkey: string;

      if (npubInput.startsWith('npub') || npubInput.startsWith('nprofile')) {
        try {
          const decoded = nip19.decode(npubInput);
          if (decoded.type === 'npub') {
            pubkey = decoded.data;
          } else if (decoded.type === 'nprofile') {
            pubkey = decoded.data.pubkey;
          } else {
            wotStatus = 'Invalid user identifier format';
            return;
          }
        } catch (e) {
          wotStatus = 'Failed to decode user identifier';
          return;
        }
      } else if (/^[0-9a-f]{64}$/i.test(npubInput)) {
        // Already hex format
        pubkey = npubInput.toLowerCase();
      } else {
        wotStatus = 'Invalid format. Use npub, nprofile, or hex pubkey';
        return;
      }

      rootPubkey = pubkey;
      wotStatus = `Building WoT for ${npubInput.slice(0, 16)}...`;

      // Create and load WoT
      wot = new NDKWoT(ndk, rootPubkey);
      await wot.load({
        depth: wotDepth,
        maxFollows: 1000,
        timeout: 60000
      });

      wotStatus = `WoT loaded with ${wot.size} users`;
      isLoading = false;
    } catch (error) {
      wotStatus = `Error: ${error instanceof Error ? error.message : String(error)}`;
      isLoading = false;
    }
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  function getWoTBadge(event: NDKEvent): { text: string; color: string } | null {
    if (!wot || !wot.isLoaded()) return null;

    if (!wot.includes(event.pubkey)) {
      return { text: 'Unknown', color: '#999' };
    }

    const distance = wot.getDistance(event.pubkey);
    const node = wot.getNode(event.pubkey);

    if (distance === 0) {
      return { text: 'You', color: '#9c27b0' };
    } else if (distance === 1) {
      return { text: `Friend (${node?.followedBy.size || 0})`, color: '#4caf50' };
    } else {
      return { text: `${distance} hops (${node?.followedBy.size || 0})`, color: '#ff9800' };
    }
  }

  // Load WoT on mount with default npub
  $effect(() => {
    if (npubInput === DEFAULT_NPUB && !wot) {
      loadWoT();
    }
  });
</script>

<main>
  <header>
    <h1>🌐 Web of Trust Explorer</h1>
    <p class="subtitle">Filter and rank Nostr events based on your social graph</p>
  </header>

  <div class="controls-container">
    <div class="wot-setup">
      <h2>Setup Your Web of Trust</h2>
      <div class="input-group">
        <label for="npub">Root User (npub, hex, or nprofile)</label>
        <input
          id="npub"
          type="text"
          bind:value={npubInput}
          placeholder="npub1... or hex pubkey"
          disabled={isLoading}
        />
      </div>

      <div class="input-group">
        <label for="depth">WoT Depth (network hops)</label>
        <div class="slider-container">
          <input
            id="depth"
            type="range"
            min="1"
            max="4"
            bind:value={wotDepth}
            disabled={isLoading}
          />
          <span class="slider-value">{wotDepth}</span>
        </div>
      </div>

      <button onclick={loadWoT} disabled={isLoading} class="primary-button">
        {isLoading ? 'Loading...' : 'Build Web of Trust'}
      </button>

      {#if wotStatus}
        <div class="status" class:loading={isLoading}>
          {wotStatus}
        </div>
      {/if}
    </div>

    {#if wot && wot.isLoaded()}
      <div class="filters">
        <h2>Filter Settings</h2>

        <div class="input-group">
          <label for="maxDepth">Max Distance</label>
          <div class="slider-container">
            <input
              id="maxDepth"
              type="range"
              min="0"
              max={wotDepth}
              bind:value={maxDepthFilter}
            />
            <span class="slider-value">{maxDepthFilter}</span>
          </div>
        </div>

        <div class="input-group">
          <label for="algorithm">Ranking Algorithm</label>
          <select id="algorithm" bind:value={rankingAlgorithm}>
            <option value="distance">By Distance (closest first)</option>
            <option value="score">By Score (highest first)</option>
            <option value="followers">By Followers (most followed first)</option>
          </select>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={includeUnknown} />
            Include users outside WoT
          </label>
        </div>

        {#if wotStats}
          <div class="stats">
            <div class="stat">
              <div class="stat-value">{wotStats.networkSize}</div>
              <div class="stat-label">Network Size</div>
            </div>
            <div class="stat">
              <div class="stat-value">{wotStats.inWoT}</div>
              <div class="stat-label">In WoT</div>
            </div>
            <div class="stat">
              <div class="stat-value">{wotStats.unknown}</div>
              <div class="stat-label">Unknown</div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="events-container">
    <h2>
      Events Feed
      <span class="event-count">({filteredEvents.length} events)</span>
    </h2>

    <div class="events-list">
      {#if filteredEvents.length === 0}
        <div class="empty-state">
          <p>No events to display</p>
          <p class="hint">
            {wot && wot.isLoaded()
              ? 'Try adjusting your filter settings or including unknown users'
              : 'Build your Web of Trust to start filtering events'}
          </p>
        </div>
      {:else}
        {#each filteredEvents as event (event.id)}
          {@const badge = getWoTBadge(event)}
          <div class="event-card">
            <div class="event-header">
              <div class="event-meta">
                <span class="pubkey">{event.pubkey.slice(0, 8)}...{event.pubkey.slice(-8)}</span>
                <span class="time">{formatTime(event.created_at!)}</span>
              </div>
              {#if badge}
                <span class="wot-badge" style="background: {badge.color}">
                  {badge.text}
                </span>
              {/if}
            </div>
            <div class="event-content">
              {event.content}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
    color: white;
  }

  h1 {
    font-size: 42px;
    margin: 0 0 12px 0;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 18px;
    opacity: 0.9;
    font-weight: 400;
  }

  .controls-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }

  @media (max-width: 768px) {
    .controls-container {
      grid-template-columns: 1fr;
    }
  }

  .wot-setup,
  .filters {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 20px;
    margin: 0 0 20px 0;
    color: #333;
    font-weight: 600;
  }

  .input-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
    font-size: 14px;
  }

  input[type="text"],
  select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: monospace;
    transition: border-color 0.2s;
  }

  input[type="text"]:focus,
  select:focus {
    outline: none;
    border-color: #667eea;
  }

  input[type="text"]:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  input[type="range"] {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    border: none;
  }

  .slider-value {
    min-width: 30px;
    text-align: center;
    font-weight: 600;
    color: #667eea;
    font-size: 16px;
  }

  .checkbox-group {
    margin-top: 16px;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .primary-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .status {
    margin-top: 16px;
    padding: 12px;
    background: #f0f4ff;
    border-left: 4px solid #667eea;
    border-radius: 4px;
    color: #333;
    font-size: 14px;
  }

  .status.loading {
    background: #fff3e0;
    border-left-color: #ff9800;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 24px;
  }

  .stat {
    text-align: center;
    padding: 16px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-radius: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .events-container {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .event-count {
    color: #999;
    font-size: 16px;
    font-weight: 400;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  .empty-state p {
    margin: 0 0 8px 0;
    font-size: 16px;
  }

  .hint {
    font-size: 14px;
    color: #bbb;
  }

  .event-card {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    border: 2px solid #f0f0f0;
    transition: border-color 0.2s, transform 0.2s;
  }

  .event-card:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
  }

  .event-meta {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .pubkey {
    font-family: monospace;
    font-size: 13px;
    color: #667eea;
    font-weight: 600;
  }

  .time {
    font-size: 13px;
    color: #999;
  }

  .wot-badge {
    padding: 4px 12px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .event-content {
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 15px;
  }
</style>
