<script lang="ts">
  import type { EnrichedRelayInfo } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import RelayCard from '$lib/ndk/relay-card/relay-card.svelte';

  interface Props {
    relays: EnrichedRelayInfo[];
    onFetchInfo?: (url: string) => void;
    onRemove?: (url: string) => void;
    onBlacklist?: (url: string) => void;
    onUnblacklist?: (url: string) => void;
    onCopyUrl?: (url: string) => void;
    emptyMessage?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    relays,
    onFetchInfo,
    onRemove,
    onBlacklist,
    onUnblacklist,
    onCopyUrl,
    emptyMessage = 'No relays found',
    class: className = '',
    children,
  }: Props = $props();
</script>

<div class="relay-list {className}">
  {#if relays.length === 0}
    <div class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="empty-icon"
      >
        <path d="M2 12 7 2" />
        <path d="m7 12 5-10" />
        <path d="m12 12 5-10" />
        <path d="m17 12 5-10" />
        <path d="M4.5 7h15" />
        <path d="M12 16v6" />
        <circle cx="12" cy="22" r="1" />
      </svg>
      <p class="empty-message">{emptyMessage}</p>
      {#if children}
        {@render children()}
      {/if}
    </div>
  {:else}
    <div class="relay-grid">
      {#each relays as relay (relay.url)}
        <RelayCard
          {relay}
          {onFetchInfo}
          {onRemove}
          {onBlacklist}
          {onUnblacklist}
          {onCopyUrl}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .relay-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .empty-icon {
    color: var(--text-tertiary, #9ca3af);
    margin-bottom: 1rem;
  }

  .empty-message {
    font-size: 1rem;
    color: var(--text-secondary, #6b7280);
    margin: 0 0 1rem 0;
  }

  .relay-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .relay-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
