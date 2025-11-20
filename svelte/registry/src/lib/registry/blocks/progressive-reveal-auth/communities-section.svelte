<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;
    onComplete?: (communities: string[]) => void;
  }

  let { ndk: ndkProp, onComplete }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  const availablePacks = [
    {
      id: 'bitcoin-devs',
      name: 'Bitcoin Developers',
      description: '124 members • Core protocol contributors',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'nostr-pioneers',
      name: 'Nostr Pioneers',
      description: '89 members • Early adopters and builders',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'creative-minds',
      name: 'Creative Minds',
      description: '156 members • Artists and creators',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'tech-enthusiasts',
      name: 'Tech Enthusiasts',
      description: '203 members • Software engineers',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  let selectedPacks = $state<string[]>([]);

  function togglePack(id: string) {
    if (selectedPacks.includes(id)) {
      selectedPacks = selectedPacks.filter(p => p !== id);
    } else {
      selectedPacks = [...selectedPacks, id];
    }
  }

  function handleContinue() {
    onComplete?.(selectedPacks);
  }
</script>

<div class="communities-section">
  <p class="hint" style="margin-bottom: 1rem;">Select communities that match your interests</p>

  <div class="pack-grid">
    {#each availablePacks as pack}
      <button
        class="pack-card"
        class:selected={selectedPacks.includes(pack.id)}
        onclick={() => togglePack(pack.id)}
        type="button"
      >
        <div class="pack-icon" style="background: {pack.gradient};"></div>
        <div class="pack-info">
          <h4>{pack.name}</h4>
          <p>{pack.description}</p>
        </div>
      </button>
    {/each}
  </div>

  <button
    class="btn btn-primary"
    onclick={handleContinue}
  >
    Continue ({selectedPacks.length} selected)
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </button>
</div>

<style>
  .communities-section {
    display: flex;
    flex-direction: column;
  }

  .pack-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .pack-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1.5px solid var(--border);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--background);
    text-align: left;
  }

  .pack-card:hover {
    background: var(--muted);
    border-color: var(--primary);
  }

  .pack-card.selected {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }

  .pack-icon {
    width: 48px;
    height: 48px;
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .pack-card.selected .pack-icon {
    opacity: 0.8;
  }

  .pack-info {
    flex: 1;
    min-width: 0;
  }

  .pack-info h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .pack-info p {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin: 0;
  }

  .pack-card.selected .pack-info p {
    color: rgba(255, 255, 255, 0.7);
  }

  .btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .hint {
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>
