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

<div class="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-lg">
  <span class="text-2xl font-bold text-primary">#</span>
  <span class="text-lg font-semibold text-foreground">{hashtag}</span>
  <button
    class="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border border-border rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-accent/80"
    onclick={onToggle}
  >
    {#if follow.isFollowing}
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
