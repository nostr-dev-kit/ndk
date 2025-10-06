<script lang="ts">
  import type NDK from '@nostr-dev-kit/ndk';
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import ContentRenderer from '../../../src/lib/components/ContentRenderer.svelte';

  interface Props {
    ndk: NDK;
    events: NDKEvent[];
    user: NDKUser;
    connectedRelays: string[];
    onAddRelay: (relayUrl: string) => Promise<void>;
    onFetchKind: (kind: number) => Promise<void>;
  }

  let { ndk, events, user, connectedRelays = [], onAddRelay, onFetchKind }: Props = $props();

  let newRelayUrl = $state('');
  let addingRelay = $state(false);
  let fetchingKinds = $state<Set<number>>(new Set());

  // Fetch user profile
  let userProfile = $state<{ name?: string; displayName?: string; image?: string; nip05?: string } | null>(null);

  $effect(() => {
    user.fetchProfile().then(() => {
      userProfile = {
        name: user.profile?.name,
        displayName: user.profile?.displayName,
        image: user.profile?.image,
        nip05: user.profile?.nip05,
      };
    });
  });

  // Kind name mappings for common kinds
  const KIND_NAMES: Record<number, string> = {
    0: 'Profile',
    1: 'Note',
    3: 'Contacts',
    4: 'DM',
    5: 'Delete',
    6: 'Repost',
    7: 'Reaction',
    40: 'Channel Create',
    41: 'Channel Metadata',
    42: 'Channel Message',
    43: 'Channel Hide',
    44: 'Channel Mute',
    1063: 'File Metadata',
    1311: 'Live Chat',
    30023: 'Long-form',
    31111: 'Classified',
  };

  // Color palette for different kinds
  const COLORS = [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#ef4444', // red
    '#10b981', // green
    '#06b6d4', // cyan
    '#f97316', // orange
    '#8b5cf6', // violet
  ];

  interface DayData {
    date: string;
    dateObj: Date;
    kinds: Record<number, number>;
    total: number;
  }

  // Process events into daily grouped data
  const processedData = $derived(() => {
    const dayMap = new Map<string, DayData>();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      dayMap.set(dateStr, {
        date: dateStr,
        dateObj: date,
        kinds: {},
        total: 0,
      });
    }

    // Count events by day and kind
    for (const event of events) {
      const date = new Date((event.created_at || 0) * 1000);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = dayMap.get(dateStr);
      if (dayData) {
        const kind = event.kind || 0;
        dayData.kinds[kind] = (dayData.kinds[kind] || 0) + 1;
        dayData.total++;
      }
    }

    return Array.from(dayMap.values());
  });

  // Get all unique kinds
  const allKinds = $derived(() => {
    const kindSet = new Set<number>();
    for (const day of processedData()) {
      for (const kind of Object.keys(day.kinds)) {
        kindSet.add(Number(kind));
      }
    }
    return Array.from(kindSet).sort((a, b) => a - b);
  });

  // Get color for kind
  function getKindColor(kind: number): string {
    const index = allKinds().indexOf(kind);
    return COLORS[index % COLORS.length];
  }

  // Get kind name
  function getKindName(kind: number): string {
    return KIND_NAMES[kind] || `Kind ${kind}`;
  }

  // Calculate max height for scaling
  const maxTotal = $derived(() => {
    return Math.max(...processedData().map(d => d.total), 1);
  });

  // Format date
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Track relay sources - include ALL relays even with 0 events
  const relayStats = $derived(() => {
    const stats = new Map<string, number>();

    // Initialize all connected relays with 0
    for (const relayUrl of connectedRelays) {
      stats.set(relayUrl, 0);
    }

    // Count events from each relay
    for (const event of events) {
      if (event.relay?.url) {
        stats.set(event.relay.url, (stats.get(event.relay.url) || 0) + 1);
      }
    }

    return Array.from(stats.entries())
      .sort(([, a], [, b]) => b - a);
  });

  // Selected day for tooltip
  let hoveredDay = $state<DayData | null>(null);
  let hoveredKind = $state<number | null>(null);

  // Selected kind/day for feed view
  let selectedKind = $state<number | null>(null);
  let selectedDay = $state<DayData | null>(null);

  // Get display name for user
  const displayName = $derived(() => {
    return userProfile?.displayName || userProfile?.name || userProfile?.nip05 || `${user.pubkey.slice(0, 8)}...`;
  });

  // Filter events by selected kind and day
  const filteredEvents = $derived(() => {
    if (!selectedKind || !selectedDay) return [];

    const dayStart = selectedDay.dateObj.getTime() / 1000;
    const dayEnd = dayStart + (24 * 60 * 60);

    return events.filter(event => {
      const eventTime = event.created_at || 0;
      return event.kind === selectedKind && eventTime >= dayStart && eventTime < dayEnd;
    }).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  });

  // Check if content is JSON
  function isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  // Format JSON content
  function formatJSON(str: string): string {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  }

  // Handle kind selection
  function handleKindClick(kind: number, day: DayData) {
    selectedKind = kind;
    selectedDay = day;
    hoveredDay = null;
  }

  // Get relay domain (remove wss://)
  function getRelayDomain(url: string): string {
    return url.replace(/^wss?:\/\//, '').replace(/\/$/, '');
  }

  async function handleAddRelay(e: Event) {
    e.preventDefault();
    if (!newRelayUrl.trim() || addingRelay) return;

    let url = newRelayUrl.trim();

    // Add wss:// if not present
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      url = 'wss://' + url;
    }

    addingRelay = true;
    try {
      await onAddRelay(url);
      newRelayUrl = '';
    } finally {
      addingRelay = false;
    }
  }

  // Track copied event IDs for visual feedback
  let copiedEventIds = $state<Set<string>>(new Set());

  // Copy event nevent to clipboard
  async function copyNevent(event: NDKEvent) {
    const nevent = event.encode();
    await navigator.clipboard.writeText(nevent);

    // Show visual feedback
    if (event.id) {
      copiedEventIds.add(event.id);
      copiedEventIds = new Set(copiedEventIds); // Trigger reactivity

      // Clear after 2 seconds
      setTimeout(() => {
        copiedEventIds.delete(event.id!);
        copiedEventIds = new Set(copiedEventIds);
      }, 2000);
    }
  }

  // Open event on nostr.com
  function openOnNostr(event: NDKEvent) {
    const nevent = event.encode();
    window.open(`https://nostr.com/${nevent}`, '_blank');
  }

  // Handle legend click to fetch more events of specific kind
  async function handleLegendClick(kind: number) {
    if (fetchingKinds.has(kind)) return;

    fetchingKinds.add(kind);
    fetchingKinds = new Set(fetchingKinds); // Trigger reactivity

    try {
      await onFetchKind(kind);
    } finally {
      fetchingKinds.delete(kind);
      fetchingKinds = new Set(fetchingKinds);
    }
  }

  // Close tooltip and feed view on escape key
  $effect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedKind !== null) {
          selectedKind = null;
          selectedDay = null;
        } else if (hoveredDay) {
          hoveredDay = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="graph-container">
  <div class="user-info">
    <div class="user-header">
      <div class="user-profile">
        <Avatar {ndk} pubkey={user.pubkey} size={80} class="user-avatar" />
        <div class="user-details">
          <h2>{displayName()}</h2>
          {#if userProfile?.nip05}
            <p class="nip05">{userProfile.nip05}</p>
          {:else}
            <p class="user-id">{user.pubkey.slice(0, 16)}...</p>
          {/if}
        </div>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">{events.length}</span>
        <span class="stat-label">Total Events</span>
      </div>
      <div class="stat">
        <span class="stat-value">{allKinds().length}</span>
        <span class="stat-label">Event Types</span>
      </div>
      <div class="stat">
        <span class="stat-value">{Math.max(...processedData().map(d => d.total))}</span>
        <span class="stat-label">Peak Day</span>
      </div>
    </div>
  </div>

  <div class="chart-wrapper">
    <div class="chart">
      <div class="bars">
        {#each processedData() as day (day.date)}
          <div
            class="bar-container"
            onclick={() => hoveredDay = hoveredDay === day ? null : day}
          >
            <div class="bar-wrapper">
              {#each allKinds() as kind}
                {@const count = day.kinds[kind] || 0}
                {@const height = (count / maxTotal()) * 100}
                {#if count > 0}
                  <div
                    class="bar-segment"
                    class:hovered={hoveredDay === day && (hoveredKind === null || hoveredKind === kind)}
                    class:dimmed={hoveredDay === day && hoveredKind !== null && hoveredKind !== kind}
                    style:height="{height}%"
                    style:background-color={getKindColor(kind)}
                    onmouseenter={() => hoveredKind = kind}
                    onmouseleave={() => hoveredKind = null}
                  ></div>
                {/if}
              {/each}
            </div>
            <div class="bar-label">{formatDate(day.date)}</div>
            {#if day.total > 0}
              <div class="bar-total">{day.total}</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    {#if hoveredDay}
      <div class="tooltip">
      <div class="tooltip-header">
        <div class="tooltip-header-left">
          <strong>{formatDate(hoveredDay.date)}</strong>
          <span>{hoveredDay.total} events</span>
        </div>
        <button class="tooltip-close" onclick={() => hoveredDay = null} aria-label="Close">✕</button>
      </div>
      <div class="tooltip-body">
        {#each Object.entries(hoveredDay.kinds).sort(([, a], [, b]) => b - a) as [kind, count]}
          <div
            class="tooltip-row"
            class:highlighted={hoveredKind === Number(kind)}
            onclick={() => handleKindClick(Number(kind), hoveredDay)}
            onmouseenter={() => hoveredKind = Number(kind)}
            onmouseleave={() => hoveredKind = null}
          >
            <div class="tooltip-kind">
              <div
                class="kind-dot"
                style:background-color={getKindColor(Number(kind))}
              ></div>
              <span>{getKindName(Number(kind))}</span>
            </div>
            <span class="tooltip-count">{count}</span>
          </div>
        {/each}
      </div>
    </div>
    {/if}
  </div>

  <div class="legend">
    {#each allKinds() as kind}
      <div
        class="legend-item"
        class:highlighted={hoveredKind === kind}
        class:loading={fetchingKinds.has(kind)}
        onmouseenter={() => hoveredKind = kind}
        onmouseleave={() => hoveredKind = null}
        onclick={() => handleLegendClick(kind)}
        title="Click to fetch more {getKindName(kind)} events"
      >
        <div
          class="legend-dot"
          style:background-color={getKindColor(kind)}
        ></div>
        <span>{getKindName(kind)}</span>
        {#if fetchingKinds.has(kind)}
          <span class="legend-spinner">⏳</span>
        {/if}
      </div>
    {/each}
  </div>

  {#if relayStats().length > 0}
    <div class="relay-section">
      <h3>Relay Sources</h3>
      <div class="relay-list">
        {#each relayStats() as [relayUrl, count]}
          <div class="relay-item" class:empty={count === 0}>
            <div class="relay-info">
              <div class="relay-icon">{count > 0 ? '⚡' : '○'}</div>
              <span class="relay-url">{getRelayDomain(relayUrl)}</span>
            </div>
            <span class="relay-count">{count}</span>
          </div>
        {/each}
      </div>

      <form onsubmit={handleAddRelay} class="add-relay-form">
        <input
          type="text"
          bind:value={newRelayUrl}
          placeholder="Add relay (e.g., relay.primal.net)"
          disabled={addingRelay}
          class="relay-input"
        />
        <button type="submit" disabled={addingRelay || !newRelayUrl.trim()} class="relay-button">
          {addingRelay ? '⏳' : '+'} {addingRelay ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  {/if}

  {#if selectedKind !== null && selectedDay}
    <div class="feed-section">
      <div class="feed-header">
        <h3>{getKindName(selectedKind)} - {formatDate(selectedDay.date)}</h3>
        <button class="feed-close" onclick={() => { selectedKind = null; selectedDay = null; }} aria-label="Close">✕</button>
      </div>
      <div class="feed-events">
        {#each filteredEvents() as event (event.id)}
          <div class="event-card">
            <div class="event-header">
              <span class="event-kind" style:background-color={getKindColor(selectedKind)}>{getKindName(selectedKind)}</span>
              <span class="event-time">{new Date((event.created_at || 0) * 1000).toLocaleTimeString()}</span>
            </div>

            {#if event.alt}
              <div class="event-alt">
                <strong>Alt:</strong> {event.alt}
              </div>
            {/if}

            {#if event.content}
              <div class="event-content">
                <strong>Content:</strong>
                {#if isJSON(event.content)}
                  <pre class="json-content">{formatJSON(event.content)}</pre>
                {:else}
                  <ContentRenderer content={event.content} emojiTags={event.tags} event={event} />
                {/if}
              </div>
            {/if}

            {#if event.tags && event.tags.length > 0}
              <div class="event-tags">
                <strong>Tags:</strong>
                <div class="tags-list">
                  {#each event.tags as tag}
                    <div class="tag-item">
                      <span class="tag-name">{tag[0]}</span>
                      {#if tag.length > 1}
                        <span class="tag-values">{tag.slice(1).join(', ')}</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="event-footer">
              <div class="event-footer-left">
                <span class="event-id">{event.id?.slice(0, 16)}...</span>
                {#if event.relay?.url}
                  <span class="event-relay">{getRelayDomain(event.relay.url)}</span>
                {/if}
              </div>
              <div class="event-actions">
                <button
                  class="event-action-btn"
                  class:copied={copiedEventIds.has(event.id || '')}
                  onclick={() => copyNevent(event)}
                  title="Copy nevent"
                >
                  {copiedEventIds.has(event.id || '') ? '✓' : '📋'}
                </button>
                <button
                  class="event-action-btn"
                  onclick={() => openOnNostr(event)}
                  title="Open on nostr.com"
                >
                  🔗
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .graph-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    padding: 2rem;
    backdrop-filter: blur(20px);
    margin-top: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .user-info {
    margin-bottom: 3rem;
  }

  .user-header {
    margin-bottom: 2rem;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  :global(.user-avatar) {
    border: 3px solid rgba(139, 92, 246, 0.3);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
    animation: fadeIn 0.5s ease;
  }

  :global(.user-avatar .avatar-placeholder) {
    border: 3px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }

  .user-details {
    flex: 1;
  }

  .user-details h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nip05 {
    font-size: 1rem;
    color: rgba(139, 92, 246, 0.8);
    margin: 0;
    font-weight: 500;
  }

  .user-id {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.5);
    margin: 0;
  }

  .stats {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .relay-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .relay-section h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(224, 230, 237, 0.9);
    margin: 0 0 1.5rem 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .stat-label {
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .relay-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .relay-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
  }

  .relay-item.empty {
    opacity: 0.5;
    background: rgba(255, 255, 255, 0.02);
  }

  .relay-item:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateX(4px);
  }

  .relay-item.empty:hover {
    opacity: 0.7;
  }

  .relay-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .relay-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
  }

  .relay-url {
    font-size: 0.9rem;
    color: rgba(224, 230, 237, 0.9);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relay-count {
    font-size: 0.9rem;
    font-weight: 700;
    color: rgba(139, 92, 246, 0.9);
    background: rgba(139, 92, 246, 0.15);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    flex-shrink: 0;
  }

  .add-relay-form {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .relay-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    padding: 0.75rem;
    color: rgba(224, 230, 237, 0.9);
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .relay-input:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  .relay-input::placeholder {
    color: rgba(224, 230, 237, 0.4);
  }

  .relay-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .relay-button {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem 1.25rem;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .relay-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  .relay-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .chart-wrapper {
    position: relative;
    margin: 2rem 0;
  }

  .chart {
    min-height: 500px;
    height: 60vh;
    display: flex;
    align-items: flex-end;
    position: relative;
  }

  .bars {
    display: flex;
    gap: 1rem;
    width: 100%;
    align-items: flex-end;
    height: 100%;
  }

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;
    height: 100%;
    justify-content: flex-end;
  }

  .bar-container:hover {
    transform: translateY(-4px);
  }

  .bar-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    flex: 1;
    transition: all 0.3s ease;
  }

  .bar-segment {
    width: 100%;
    border-radius: 4px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: growUp 0.6s ease backwards;
  }

  @keyframes growUp {
    from {
      height: 0 !important;
      opacity: 0;
    }
  }

  .bar-segment.hovered {
    filter: brightness(1.3);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  }

  .bar-segment.dimmed {
    opacity: 0.3;
  }

  .bar-label {
    font-size: 0.75rem;
    color: rgba(224, 230, 237, 0.7);
    font-weight: 500;
  }

  .bar-total {
    font-size: 0.875rem;
    font-weight: 700;
    color: rgba(224, 230, 237, 0.9);
    margin-top: 0.25rem;
  }

  .tooltip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(15, 20, 25, 0.95);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 1rem;
    padding: 1rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.2s ease;
    z-index: 10;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tooltip-header-left {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    gap: 1rem;
  }

  .tooltip-header strong {
    font-size: 1.125rem;
    color: #e0e6ed;
  }

  .tooltip-header span {
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.6);
  }

  .tooltip-close {
    background: none;
    border: none;
    color: rgba(224, 230, 237, 0.6);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
    line-height: 1;
    flex-shrink: 0;
  }

  .tooltip-close:hover {
    color: #e0e6ed;
    background: rgba(255, 255, 255, 0.1);
  }

  .tooltip-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .tooltip-row:hover {
    background: rgba(139, 92, 246, 0.15);
    transform: translateX(4px);
  }

  .tooltip-row.highlighted {
    background: rgba(139, 92, 246, 0.1);
  }

  .tooltip-kind {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .kind-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }

  .tooltip-count {
    font-weight: 700;
    color: #e0e6ed;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .legend-item:hover,
  .legend-item.highlighted {
    background: rgba(139, 92, 246, 0.1);
    transform: translateY(-2px);
  }

  .legend-item.loading {
    opacity: 0.6;
    cursor: wait;
  }

  .legend-item.loading:hover {
    transform: none;
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }

  .legend-item span {
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.9);
    font-weight: 500;
  }

  .legend-spinner {
    font-size: 0.875rem;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .feed-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .feed-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: rgba(224, 230, 237, 0.9);
    margin: 0;
  }

  .feed-close {
    background: none;
    border: none;
    color: rgba(224, 230, 237, 0.6);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
    line-height: 1;
  }

  .feed-close:hover {
    color: #e0e6ed;
    background: rgba(255, 255, 255, 0.1);
  }

  .feed-events {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .feed-events::-webkit-scrollbar {
    width: 8px;
  }

  .feed-events::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .feed-events::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 4px;
  }

  .feed-events::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
  }

  .event-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.2s ease;
  }

  .event-card:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .event-kind {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
  }

  .event-time {
    font-size: 0.875rem;
    color: rgba(224, 230, 237, 0.6);
  }

  .event-alt {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: rgba(139, 92, 246, 0.1);
    border-left: 3px solid rgba(139, 92, 246, 0.5);
    border-radius: 0.25rem;
  }

  .event-alt strong {
    color: rgba(139, 92, 246, 0.9);
  }

  .event-content {
    margin-bottom: 0.75rem;
  }

  .event-content strong {
    display: block;
    margin-bottom: 0.5rem;
    color: rgba(224, 230, 237, 0.7);
    font-size: 0.875rem;
  }

  .event-content p {
    margin: 0;
    color: rgba(224, 230, 237, 0.9);
    line-height: 1.5;
  }

  .json-content {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
    color: #10b981;
    margin: 0;
  }

  .event-tags {
    margin-bottom: 0.75rem;
  }

  .event-tags strong {
    display: block;
    margin-bottom: 0.5rem;
    color: rgba(224, 230, 237, 0.7);
    font-size: 0.875rem;
  }

  .tags-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tag-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.25rem;
  }

  .tag-name {
    font-weight: 600;
    color: rgba(139, 92, 246, 0.9);
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
  }

  .tag-values {
    color: rgba(224, 230, 237, 0.8);
    font-size: 0.75rem;
    font-family: 'Monaco', 'Courier New', monospace;
    word-break: break-all;
  }

  .event-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.75rem;
  }

  .event-footer-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .event-id {
    color: rgba(224, 230, 237, 0.5);
    font-family: 'Monaco', 'Courier New', monospace;
  }

  .event-relay {
    color: rgba(139, 92, 246, 0.7);
    font-weight: 500;
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
  }

  .event-action-btn {
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 0.5rem;
    padding: 0.4rem 0.6rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .event-action-btn:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  }

  .event-action-btn:active {
    transform: translateY(0);
  }

  .event-action-btn.copied {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.5);
    color: #10b981;
  }

  @media (max-width: 768px) {
    .graph-container {
      padding: 1.5rem;
    }

    .user-profile {
      flex-direction: column;
      align-items: flex-start;
    }

    .user-details h2 {
      font-size: 1.5rem;
    }

    .stats {
      gap: 1rem;
    }

    .relay-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
    }

    .relay-section h3 {
      font-size: 1.1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .relay-url {
      font-size: 0.8rem;
    }

    .add-relay-form {
      flex-direction: column;
    }

    .relay-button {
      width: 100%;
    }

    .chart {
      min-height: 400px;
      height: 50vh;
    }

    .bars {
      gap: 0.5rem;
    }

    .bar-label {
      font-size: 0.625rem;
    }

    .event-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .event-footer-left {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .event-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
