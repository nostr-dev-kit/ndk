<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import FollowAction from '$lib/ndk/actions/follow-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    hashtag: string;
    onfollowsuccess: (e: Event) => void;
    onfollowerror: (e: Event) => void;
  }

  let { ndk, hashtag, onfollowsuccess, onfollowerror }: Props = $props();
</script>

<div class="hashtag-display">
  <span class="hashtag-icon">#</span>
  <span class="hashtag-text">{hashtag}</span>
  <FollowAction
    {ndk}
    target={hashtag}
    {onfollowsuccess}
    {onfollowerror}
  />
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
</style>
