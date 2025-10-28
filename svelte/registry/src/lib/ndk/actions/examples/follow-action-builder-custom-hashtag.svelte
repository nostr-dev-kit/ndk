<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    hashtag: string;
    onToggle: () => void;
  }

  let { ndk, hashtag, onToggle }: Props = $props();

  const follow = createFollowAction(() => ({ target: hashtag }), ndk);
</script>

<div class="hashtag-display">
  <span class="hashtag-icon">#</span>
  <span class="hashtag-text">{hashtag}</span>
  <button
    class="custom-hashtag-btn"
    onclick={onToggle}
  >
    {#if follow.isFollowing}
      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      Subscribed
    {:else}
      Subscribe
    {/if}
  </button>
</div>

<style>
  .hashtag-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .hashtag-icon {
    font-size: 1.5rem;
    font-weight: 700;
    color: hsl(var(--color-primary));
  }

  .hashtag-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .custom-hashtag-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-accent));
    color: hsl(var(--color-accent-foreground));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-hashtag-btn:hover {
    background: hsl(var(--color-accent) / 0.8);
  }

  .custom-hashtag-btn .icon {
    width: 1rem;
    height: 1rem;
  }
</style>
