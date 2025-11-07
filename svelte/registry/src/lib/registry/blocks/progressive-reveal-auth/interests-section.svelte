<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;
    onComplete?: (interests: string[]) => void;
  }

  let { ndk: ndkProp, onComplete }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  const availableInterests = [
    { tag: '#bitcoin', count: '12.4k' },
    { tag: '#nostr', count: '8.2k' },
    { tag: '#tech', count: '15.7k' },
    { tag: '#art', count: '9.1k' },
    { tag: '#music', count: '11.3k' },
    { tag: '#photography', count: '6.8k' },
    { tag: '#coding', count: '7.9k' },
    { tag: '#design', count: '5.3k' },
    { tag: '#privacy', count: '4.6k' },
    { tag: '#freedom', count: '3.8k' },
    { tag: '#gaming', count: '6.2k' },
    { tag: '#writing', count: '4.1k' },
  ];

  let selectedTags = $state<string[]>([]);

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      selectedTags = [...selectedTags, tag];
    }
  }

  function handleContinue() {
    onComplete?.(selectedTags);
  }
</script>

<div class="interests-section">
  <p class="hint" style="margin-bottom: 1rem;">Select at least 3 interests to personalize your feed</p>

  <div class="tag-grid">
    {#each availableInterests as interest}
      <button
        class="tag-item"
        class:selected={selectedTags.includes(interest.tag)}
        onclick={() => toggleTag(interest.tag)}
        type="button"
      >
        <span class="tag-name">{interest.tag}</span>
        <span class="tag-count">{interest.count} notes</span>
      </button>
    {/each}
  </div>

  <button
    class="btn btn-primary"
    onclick={handleContinue}
    disabled={selectedTags.length < 3}
  >
    Continue ({selectedTags.length} selected)
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </button>
</div>

<style>
  .interests-section {
    display: flex;
    flex-direction: column;
  }

  .tag-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .tag-item {
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: 0.75rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    font-weight: 500;
    background: var(--background);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tag-item:hover {
    background: var(--muted);
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .tag-item.selected {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }

  .tag-name {
    font-weight: 600;
  }

  .tag-count {
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  .tag-item.selected .tag-count {
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

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    .tag-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
