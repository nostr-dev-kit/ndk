<!-- @ndk-version: relay-card@0.7.0 -->
<!--
  @component RelayCard
  Full-featured relay card component with expandable sections and connection stats.

  Uses Relay primitives for consistent rendering of relay information.

  @example
  ```svelte
  <RelayCard {relay} expanded={true} />
  ```
-->
<script lang="ts">
  import type { BookmarkedRelayWithStats, NDKRelayInformation, RelayStatus } from '@nostr-dev-kit/svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { Relay } from '../../ui/relay';

  interface ExtendedRelayStats extends BookmarkedRelayWithStats {
    nip11?: NDKRelayInformation | null;
    error?: Error | null;
    status?: RelayStatus;
    connectionStats?: {
      attempts: number;
      success: number;
      connectedAt?: number;
    };
    isRead?: boolean;
    isWrite?: boolean;
    isBoth?: boolean;
    isBlacklisted?: boolean;
  }

  interface Props {
    ndk?: NDKSvelte;
    relay: ExtendedRelayStats;
    onFetchInfo?: (url: string) => void;
    onRemove?: (url: string) => void;
    onBlacklist?: (url: string) => void;
    onUnblacklist?: (url: string) => void;
    onCopyUrl?: (url: string) => void;
    expanded?: boolean;
  }

  let {
    ndk = getContext('ndk'),
    relay,
    onFetchInfo,
    onRemove,
    onBlacklist,
    onUnblacklist,
    onCopyUrl,
    expanded = false,
  }: Props = $props();

  let isExpanded = $state(expanded);
  let copied = $state(false);

  // Automatically fetch relay info when component mounts if not already loaded
  $effect(() => {
    if (!relay.nip11 && !relay.error && onFetchInfo) {
      onFetchInfo(relay.url);
    }
  });

  function handleCopy() {
    if (onCopyUrl) {
      onCopyUrl(relay.url);
    } else {
      navigator.clipboard.writeText(relay.url);
    }
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  const uptime = $derived.by(() => {
    if (!relay.connectionStats?.connectedAt) return null;
    const now = Date.now();
    return formatDuration(now - relay.connectionStats.connectedAt);
  });

  const successRate = $derived.by(() => {
    if (!relay.connectionStats) return 0;
    const { attempts, success } = relay.connectionStats;
    if (attempts === 0) return 0;
    return Math.round((success / attempts) * 100);
  });
</script>

<Relay.Root {ndk} relayUrl={relay.url} nip11={relay.nip11}>
  <div class="relay-card">
    <div class="relay-card-header" onclick={() => (isExpanded = !isExpanded)} onkeydown={(e) => e.key === 'Enter' && (isExpanded = !isExpanded)} role="button" tabindex="0">
      <div class="relay-card-header-left">
        <Relay.ConnectionStatus status={relay.status || 'disconnected'} size="md" />
        <Relay.Icon class="relay-icon" />
        <div class="relay-card-title">
          <div class="relay-card-name">
            <Relay.Name class="font-semibold" />
          </div>
          <Relay.Url class="relay-card-url" showProtocol={false} />
        </div>
      </div>

      <div class="relay-card-badges">
        {#if relay.isRead}
          <span class="badge badge-read">Read</span>
        {/if}
        {#if relay.isWrite}
          <span class="badge badge-write">Write</span>
        {/if}
        {#if relay.isBoth}
          <span class="badge badge-both">Both</span>
        {/if}
        {#if relay.isBlacklisted}
          <span class="badge badge-blacklist">Blacklisted</span>
        {/if}
      </div>

      <button class="expand-button" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
        <svg
          class="expand-icon {isExpanded ? 'rotate-180' : ''}"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>

    {#if isExpanded}
      <div class="relay-card-body">
        <div class="relay-section">
          <h4>Description</h4>
          <Relay.Description class="relay-section-text" />
        </div>

        <div class="relay-section">
          <h4>Connection Stats</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Attempts</span>
              <span class="stat-value">{relay.connectionStats?.attempts ?? 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Success</span>
              <span class="stat-value">{relay.connectionStats?.success ?? 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Success Rate</span>
              <span class="stat-value">{successRate}%</span>
            </div>
            {#if uptime}
              <div class="stat-item">
                <span class="stat-label">Uptime</span>
                <span class="stat-value">{uptime}</span>
              </div>
            {/if}
          </div>
        </div>

        {#if relay.nip11}
          <div class="relay-section">
            <h4>Relay Information</h4>
            <div class="info-grid">
              {#if relay.nip11.software}
                <div class="info-item">
                  <span class="info-label">Software</span>
                  <span class="info-value">{relay.nip11.software} {relay.nip11.version || ''}</span>
                </div>
              {/if}
              {#if relay.nip11.contact}
                <div class="info-item">
                  <span class="info-label">Contact</span>
                  <span class="info-value">{relay.nip11.contact}</span>
                </div>
              {/if}
              {#if relay.nip11.supported_nips && relay.nip11.supported_nips.length > 0}
                <div class="info-item">
                  <span class="info-label">Supported NIPs</span>
                  <div class="nips-list">
                    {#each relay.nip11.supported_nips.sort((a, b) => a - b) as nip (nip)}
                      <span class="nip-badge">{nip}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          {#if relay.nip11.limitation}
            <div class="relay-section">
              <h4>Limitations</h4>
              <div class="info-grid">
                {#if relay.nip11.limitation.max_message_length !== undefined}
                  <div class="info-item">
                    <span class="info-label">Max Message Length</span>
                    <span class="info-value">{relay.nip11.limitation.max_message_length.toLocaleString()}</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.max_subscriptions !== undefined}
                  <div class="info-item">
                    <span class="info-label">Max Subscriptions</span>
                    <span class="info-value">{relay.nip11.limitation.max_subscriptions}</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.max_filters !== undefined}
                  <div class="info-item">
                    <span class="info-label">Max Filters</span>
                    <span class="info-value">{relay.nip11.limitation.max_filters}</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.auth_required}
                  <div class="info-item">
                    <span class="info-label">Auth Required</span>
                    <span class="info-value badge badge-warning">Yes</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.payment_required}
                  <div class="info-item">
                    <span class="info-label">Payment Required</span>
                    <span class="info-value badge badge-warning">Yes</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/if}

        {#if relay.error}
          <div class="relay-section error">
            <h4>Error</h4>
            <p>{relay.error}</p>
          </div>
        {/if}

        <div class="relay-actions">
          <button class="action-button copy-button" onclick={handleCopy}>
            {#if copied}
              ✓ Copied
            {:else}
              Copy URL
            {/if}
          </button>

          {#if !relay.isBlacklisted && onBlacklist}
            <button class="action-button blacklist-button" onclick={() => onBlacklist?.(relay.url)}>
              Blacklist
            </button>
          {/if}

          {#if relay.isBlacklisted && onUnblacklist}
            <button class="action-button unblacklist-button" onclick={() => onUnblacklist?.(relay.url)}>
              Remove from Blacklist
            </button>
          {/if}

          {#if onRemove}
            <button class="action-button remove-button" onclick={() => onRemove?.(relay.url)}>
              Remove
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Relay.Root>

<style>
  .relay-card {
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--card);
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .relay-card:hover {
    box-shadow: 0 4px 12px color-mix(in srgb, var(--foreground) 10%, transparent);
  }

  .relay-card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .relay-card-header:hover {
    background: var(--accent);
  }

  .relay-card-header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .relay-card-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .relay-card-name {
    font-size: 1rem;
    font-weight: 500;
    color: var(--foreground);
  }

  .relay-card-url {
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--muted-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relay-card-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .badge-read {
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    color: var(--primary);
  }

  .badge-write {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
  }

  .badge-both {
    background: color-mix(in srgb, var(--success) 10%, transparent);
    color: var(--success);
  }

  .badge-blacklist {
    background: color-mix(in srgb, var(--destructive) 10%, transparent);
    color: var(--destructive);
  }

  .badge-warning {
    background: color-mix(in srgb, var(--warning) 10%, transparent);
    color: var(--warning);
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .expand-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: var(--muted-foreground);
    transition: color 0.2s ease;
  }

  .expand-button:hover {
    color: var(--foreground);
  }

  .expand-icon {
    transition: transform 0.2s ease;
  }

  .expand-icon.rotate-180 {
    transform: rotate(180deg);
  }

  .relay-card-body {
    padding: 0 1rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .relay-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .relay-section.error {
    background: color-mix(in srgb, var(--destructive) 5%, transparent);
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--destructive) 20%, transparent);
  }

  .relay-section h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
    margin: 0;
  }

  .relay-section p,
  .relay-section-text {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
    line-height: 1.5;
  }

  .stats-grid,
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .stat-item,
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label,
  .info-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .stat-value,
  .info-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .nips-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .nip-badge {
    padding: 0.125rem 0.5rem;
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    color: var(--primary);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .relay-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
  }

  .action-button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--background);
  }

  .copy-button {
    color: var(--foreground);
  }

  .copy-button:hover {
    background: var(--accent);
    border-color: var(--primary);
  }

  .blacklist-button {
    color: var(--destructive);
  }

  .blacklist-button:hover {
    background: color-mix(in srgb, var(--destructive) 5%, transparent);
    border-color: var(--destructive);
  }

  .unblacklist-button {
    color: var(--success);
  }

  .unblacklist-button:hover {
    background: color-mix(in srgb, var(--success) 5%, transparent);
    border-color: var(--success);
  }

  .remove-button {
    color: var(--destructive);
  }

  .remove-button:hover {
    background: color-mix(in srgb, var(--destructive) 5%, transparent);
    border-color: var(--destructive);
  }

  @media (max-width: 640px) {
    .relay-card-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .relay-card-header-left {
      width: 100%;
    }

    .relay-card-badges {
      width: 100%;
    }

    .stats-grid,
    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
