<!--
  @component ZapAction
  Zap (lightning payment) button with amount display.
-->
<script lang="ts">
  import { NDKEvent, type NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createZapAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    ndk?: NDKSvelte;
    event?: NDKEvent;
    user?: NDKUser;
    amount?: number;
    showCount?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, event: eventProp, user, amount = 1000, showCount = true, class: className = '' }: Props = $props();

  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  const ndk = $derived(ndkProp || ctx?.ndk);
  const event = $derived(eventProp || ctx?.event);
  const target = $derived(event || user);

  const zapState = createZapAction(() => ({ ndk, target }));

  async function handleZap() {
    if (!ndk?.$currentUser) {
      console.log('User must be logged in to zap');
      return;
    }
    try {
      await zapState.zap(amount);
    } catch (error) {
      console.error('Failed to zap:', error);
    }
  }
</script>

<button
  onclick={handleZap}
  class={cn('zap-action', zapState.hasZapped && 'zap-action--active', className)}
  aria-label={`Zap (${zapState.totalAmount} sats)`}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
  </svg>
  {#if showCount && zapState.totalAmount > 0}
    <span>{zapState.totalAmount}</span>
  {/if}
</button>

<style>
  .zap-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .zap-action--active { color: #f59e0b !important; }
</style>
