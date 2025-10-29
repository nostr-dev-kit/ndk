<!-- @ndk-version: relay-pool-tabs@0.3.0 -->
<script lang="ts">
  import type { PoolType } from '@nostr-dev-kit/svelte';

  interface Props {
    selected: PoolType;
    onSelect: (pool: PoolType) => void;
    counts?: Record<PoolType, number>;
    class?: string;
  }

  let { selected, onSelect, counts, class: className = '' }: Props = $props();

  // Generate tabs from available pools
  const tabs = $derived.by(() => {
    const poolNames = counts ? Object.keys(counts) : [];

    return poolNames.map(name => {
      // Icon mapping
      const iconMap: Record<string, string> = {
        'all': '🌐',
        'Main': '🏠',
        'Outbox Pool': '📤',
        'blacklist': '🚫',
      };

      return {
        id: name,
        label: name === 'all' ? 'All Relays' : name,
        icon: iconMap[name] || '📡',
      };
    });
  });

  function getCount(pool: PoolType): number | undefined {
    return counts?.[pool];
  }
</script>

<div class="relay-pool-tabs {className}">
  <div class="tabs-container">
    <div class="tabs-list" role="tablist">
      {#each tabs as tab (tab.id)}
        <button
          class="tab {selected === tab.id ? 'active' : ''}"
          role="tab"
          aria-selected={selected === tab.id}
          onclick={() => onSelect(tab.id)}
        >
          {#if tab.icon}
            <span class="tab-icon">{tab.icon}</span>
          {/if}
          <span class="tab-label">{tab.label}</span>
          {#if getCount(tab.id) !== undefined}
            <span class="tab-count">{getCount(tab.id)}</span>
          {/if}
        </button>
      {/each}
    </div>
    <div class="tabs-indicator" style:--indicator-left="{tabs.findIndex(t => t.id === selected) * 100}%"></div>
  </div>
</div>

<style>
  .relay-pool-tabs {
    width: 100%;
    background: var(--tabs-bg);
    border-bottom: 1px solid var(--border-color);
  }

  .tabs-container {
    position: relative;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tabs-container::-webkit-scrollbar {
    display: none;
  }

  .tabs-list {
    display: flex;
    gap: 0.25rem;
    padding: 0 1rem;
    min-width: min-content;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    white-space: nowrap;
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .tab:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }

  .tab.active {
    color: var(--primary-color);
    background: transparent;
  }

  .tab-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .tab-label {
    font-weight: 500;
  }

  .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.375rem;
    background: var(--count-bg);
    color: var(--count-text);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .tab.active .tab-count {
    background: var(--primary-light, color-mix(in srgb, var(--primary) 10%, transparent));
    color: var(--primary-color);
  }

  .tabs-indicator {
    position: absolute;
    bottom: 0;
    left: var(--indicator-left, 0);
    height: 2px;
    width: calc(100% / 6);
    background: var(--primary-color);
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px 2px 0 0;
  }

  @media (max-width: 768px) {
    .tabs-list {
      padding: 0 0.5rem;
    }

    .tab {
      padding: 0.625rem 0.75rem;
      font-size: 0.8125rem;
    }

    .tab-icon {
      font-size: 0.875rem;
    }

    .tab-label {
      display: none;
    }

    .tab:hover .tab-label,
    .tab.active .tab-label {
      display: inline;
    }
  }
</style>
