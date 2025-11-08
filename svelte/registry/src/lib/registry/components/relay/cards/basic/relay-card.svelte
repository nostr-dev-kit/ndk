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

<Relay.Root {ndk} relayUrl={relay.url}>
  <div data-relay-card="" data-expanded={isExpanded ? '' : undefined} class="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200 hover:shadow-lg">
    <div class="flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-accent" onclick={() => (isExpanded = !isExpanded)} onkeydown={(e) => e.key === 'Enter' && (isExpanded = !isExpanded)} role="button" tabindex="0">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <Relay.ConnectionStatus status={relay.status || 'disconnected'} size="md" />
        <Relay.Icon class="w-6 h-6 flex-shrink-0" />
        <div class="flex flex-col gap-1 min-w-0">
          <div class="text-base font-medium text-foreground">
            <Relay.Name class="font-semibold" />
          </div>
          <Relay.Url class="text-sm text-muted-foreground truncate" showProtocol={false} />
        </div>
      </div>

      <div class="flex gap-2 flex-wrap">
        {#if relay.isRead}
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-primary/10 text-primary">Read</span>
        {/if}
        {#if relay.isWrite}
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-accent/10 text-accent">Write</span>
        {/if}
        {#if relay.isBoth}
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-500/10 text-green-600">Both</span>
        {/if}
        {#if relay.isBlacklisted}
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-destructive/10 text-destructive">Blacklisted</span>
        {/if}
      </div>

      <button class="bg-transparent border-none cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground">
        <svg
          class="w-5 h-5 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}"
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
          <path d="m6 9 6 6 6-6" ></path>
        </svg>
      </button>
    </div>

    {#if isExpanded}
      <div class="p-4 border-t border-border bg-muted/30">
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-foreground mb-3">Description</h4>
          <Relay.Description class="text-sm text-muted-foreground leading-relaxed" />
        </div>

        <div class="mb-6">
          <h4 class="text-sm font-semibold text-foreground mb-3">Connection Stats</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted-foreground">Attempts</span>
              <span class="text-base font-semibold text-foreground">{relay.connectionStats?.attempts ?? 0}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted-foreground">Success</span>
              <span class="text-base font-semibold text-foreground">{relay.connectionStats?.success ?? 0}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted-foreground">Success Rate</span>
              <span class="text-base font-semibold text-foreground">{successRate}%</span>
            </div>
            {#if uptime}
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Uptime</span>
                <span class="text-base font-semibold text-foreground">{uptime}</span>
              </div>
            {/if}
          </div>
        </div>

        {#if relay.nip11}
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-foreground mb-3">Relay Information</h4>
            <div class="space-y-3">
              {#if relay.nip11.software}
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-muted-foreground min-w-[120px]">Software</span>
                  <span class="text-sm text-foreground text-right">{relay.nip11.software} {relay.nip11.version || ''}</span>
                </div>
              {/if}
              {#if relay.nip11.contact}
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-muted-foreground min-w-[120px]">Contact</span>
                  <span class="text-sm text-foreground text-right break-all">{relay.nip11.contact}</span>
                </div>
              {/if}
              {#if relay.nip11.supported_nips && relay.nip11.supported_nips.length > 0}
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-muted-foreground min-w-[120px]">Supported NIPs</span>
                  <div class="flex flex-wrap gap-1.5 justify-end">
                    {#each relay.nip11.supported_nips.sort((a, b) => a - b) as nip (nip)}
                      <span class="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{nip}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          {#if relay.nip11.limitation}
            <div class="mb-6">
              <h4 class="text-sm font-semibold text-foreground mb-3">Limitations</h4>
              <div class="space-y-3">
                {#if relay.nip11.limitation.max_message_length !== undefined}
                  <div class="flex justify-between items-start gap-4">
                    <span class="text-xs text-muted-foreground min-w-[120px]">Max Message Length</span>
                    <span class="text-sm text-foreground">{relay.nip11.limitation.max_message_length.toLocaleString()}</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.max_subscriptions !== undefined}
                  <div class="flex justify-between items-start gap-4">
                    <span class="text-xs text-muted-foreground min-w-[120px]">Max Subscriptions</span>
                    <span class="text-sm text-foreground">{relay.nip11.limitation.max_subscriptions}</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.auth_required}
                  <div class="flex justify-between items-start gap-4">
                    <span class="text-xs text-muted-foreground min-w-[120px]">Auth Required</span>
                    <span class="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-xs">Yes</span>
                  </div>
                {/if}
                {#if relay.nip11.limitation.payment_required}
                  <div class="flex justify-between items-start gap-4">
                    <span class="text-xs text-muted-foreground min-w-[120px]">Payment Required</span>
                    <span class="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-xs">Yes</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/if}

        {#if relay.error}
          <div class="mb-6 p-3 bg-destructive/10 border border-destructive rounded-lg">
            <h4 class="text-sm font-semibold text-destructive mb-2">Error</h4>
            <p class="text-sm text-destructive">{relay.error}</p>
          </div>
        {/if}

        <div class="flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90" onclick={handleCopy}>
            {#if copied}
              ✓ Copied
            {:else}
              Copy URL
            {/if}
          </button>

          {#if !relay.isBlacklisted && onBlacklist}
            <button class="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium transition-colors hover:bg-destructive/90" onclick={() => onBlacklist?.(relay.url)}>
              Blacklist
            </button>
          {/if}

          {#if relay.isBlacklisted && onUnblacklist}
            <button class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700" onclick={() => onUnblacklist?.(relay.url)}>
              Remove from Blacklist
            </button>
          {/if}

          {#if onRemove}
            <button class="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium transition-colors hover:bg-muted/80" onclick={() => onRemove?.(relay.url)}>
              Remove
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Relay.Root>
