<!-- @ndk-version: relay-card@0.7.0 -->
<script lang="ts">
  import type { BookmarkedRelayWithStats, NDKRelayInformation, RelayStatus } from '@nostr-dev-kit/svelte';
  import RelayConnectionStatus from '../relay-connection-status/relay-connection-status.svelte';

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
    relay: ExtendedRelayStats;
    onFetchInfo?: (url: string) => void;
    onRemove?: (url: string) => void;
    onBlacklist?: (url: string) => void;
    onUnblacklist?: (url: string) => void;
    onCopyUrl?: (url: string) => void;
    expanded?: boolean;
  }

  let {
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

  const displayUrl = $derived.by(() => {
    return relay.url.replace(/^wss?:\/\//, '');
  });
</script>

<div class="relay-card">
  <div class="relay-card-header" onclick={() => (isExpanded = !isExpanded)} onkeydown={(e) => e.key === 'Enter' && (isExpanded = !isExpanded)} role="button" tabindex="0">
    <div class="relay-card-header-left">
      <RelayConnectionStatus status={relay.status || 'disconnected'} size="md" />
      {#if relay.nip11?.icon}
        <img src={relay.nip11.icon} alt="{relay.nip11.name || relay.url} icon" class="relay-icon" />
      {/if}
      <div class="relay-card-title">
        <div class="relay-card-name">
          {#if relay.nip11?.name}
            <span class="font-semibold">{relay.nip11.name}</span>
          {:else}
            <span class="font-mono text-sm">{displayUrl}</span>
          {/if}
        </div>
        {#if relay.nip11?.name}
          <div class="relay-card-url">{displayUrl}</div>
        {/if}
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
      {#if relay.nip11?.description}
        <div class="relay-section">
          <h4>Description</h4>
          <p>{relay.nip11.description}</p>
        </div>
      {/if}

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

<style>
  .relay-card {
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    background: var(--color-card);
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .relay-card:hover {
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-foreground) 10%, transparent);
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
    background: var(--color-accent);
  }

  .relay-card-header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .relay-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    object-fit: cover;
    flex-shrink: 0;
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
    color: var(--color-foreground);
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
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }

  .badge-write {
    background: color-mix(in srgb, var(--color-accent) 10%, transparent);
    color: var(--color-accent);
  }

  .badge-both {
    background: color-mix(in srgb, var(--color-success) 10%, transparent);
    color: var(--color-success);
  }

  .badge-blacklist {
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    color: var(--color-destructive);
  }

  .badge-warning {
    background: color-mix(in srgb, var(--color-warning) 10%, transparent);
    color: var(--color-warning);
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
    color: var(--color-foreground);
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
    background: color-mix(in srgb, var(--color-destructive) 5%, transparent);
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--color-destructive) 20%, transparent);
  }

  .relay-section h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-foreground);
    margin: 0;
  }

  .relay-section p {
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
    color: var(--color-foreground);
  }

  .nips-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .nip-badge {
    padding: 0.125rem 0.5rem;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .relay-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }

  .action-button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--color-background);
  }

  .copy-button {
    color: var(--color-foreground);
  }

  .copy-button:hover {
    background: var(--color-accent);
    border-color: var(--color-primary);
  }

  .blacklist-button {
    color: var(--color-destructive);
  }

  .blacklist-button:hover {
    background: color-mix(in srgb, var(--color-destructive) 5%, transparent);
    border-color: var(--color-destructive);
  }

  .unblacklist-button {
    color: var(--color-success);
  }

  .unblacklist-button:hover {
    background: color-mix(in srgb, var(--color-success) 5%, transparent);
    border-color: var(--color-success);
  }

  .remove-button {
    color: var(--color-destructive);
  }

  .remove-button:hover {
    background: color-mix(in srgb, var(--color-destructive) 5%, transparent);
    border-color: var(--color-destructive);
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
