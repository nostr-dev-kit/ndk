<!--
  @component RepostAction
  Repost button with count display.
  Can be used standalone OR within EventCard context.
-->
<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    ndk?: NDKSvelte;
    event?: NDKEvent;
    showCount?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, event: eventProp, showCount = true, class: className = '' }: Props = $props();

  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  const ndk = $derived(ndkProp || ctx?.ndk);
  const event = $derived(eventProp || ctx?.event);

  const repostState = createRepostAction(ndk, () => event);

  async function handleRepost() {
    if (!ndk?.$currentUser) {
      console.log('User must be logged in to repost');
      return;
    }
    try {
      await repostState.toggle();
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  }
</script>

<button
  onclick={handleRepost}
  class={cn('repost-action', repostState.hasReposted && 'repost-action--active', className)}
  aria-label={`Repost (${repostState.count})`}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
  {#if showCount && repostState.count > 0}
    <span>{repostState.count}</span>
  {/if}
</button>

<style>
  .repost-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .repost-action--active { color: #10b981 !important; }
</style>
