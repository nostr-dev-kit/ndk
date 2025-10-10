<script lang="ts">
  interface RelayInfo {
    url: string;
    name: string;
    description: string;
  }

  interface Props {
    selectedRelays: Set<string>;
    onSelectionChange?: (relays: Set<string>) => void;
  }

  let { selectedRelays = $bindable(new Set()), onSelectionChange }: Props = $props();

  const suggestedRelays: RelayInfo[] = [
    {
      url: 'wss://relay.primal.net',
      name: 'Primal',
      description: 'Fast and reliable public relay',
    },
    {
      url: 'wss://relay.damus.io',
      name: 'Damus',
      description: 'Popular iOS-friendly relay',
    },
    {
      url: 'wss://nos.lol',
      name: 'nos.lol',
      description: 'High-performance relay',
    },
    {
      url: 'wss://relay.nostr.band',
      name: 'Nostr Band',
      description: 'Analytics and search relay',
    },
  ];

  function toggleRelay(url: string) {
    const newSelection = new Set(selectedRelays);
    if (newSelection.has(url)) {
      newSelection.delete(url);
    } else {
      newSelection.add(url);
    }
    selectedRelays = newSelection;
    onSelectionChange?.(newSelection);
  }
</script>

<div class="relay-selector">
  <div class="selector-header">
    <h3>Select relays to sync your wallet data</h3>
    <p class="hint">Choose at least one relay to store your encrypted wallet</p>
  </div>

  <div class="relay-list">
    {#each suggestedRelays as relay}
      <button
        class="relay-item"
        class:selected={selectedRelays.has(relay.url)}
        onclick={() => toggleRelay(relay.url)}
      >
        <div class="relay-icon">
          <div class="icon-inner">📡</div>
        </div>

        <div class="relay-info">
          <div class="relay-name">{relay.name}</div>
          <div class="relay-description">{relay.description}</div>
        </div>

        {#if selectedRelays.has(relay.url)}
          <div class="check-icon">✓</div>
        {/if}
      </button>
    {/each}
  </div>

  <div class="selection-count">
    {selectedRelays.size} relay{selectedRelays.size === 1 ? '' : 's'} selected
  </div>
</div>

<style>
  .relay-selector {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .selector-header {
    text-align: center;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .relay-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .relay-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .relay-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(249, 115, 22, 0.3);
    transform: translateY(-1px);
  }

  .relay-item.selected {
    background: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.5);
  }

  .relay-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-inner {
    font-size: 1.5rem;
  }

  .relay-info {
    flex: 1;
    min-width: 0;
  }

  .relay-name {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.25rem;
  }

  .relay-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .check-icon {
    font-size: 1.25rem;
    color: #f97316;
    flex-shrink: 0;
  }

  .selection-count {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
