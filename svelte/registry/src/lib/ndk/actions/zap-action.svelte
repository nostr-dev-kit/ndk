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

  const zapState = createZapAction(() => ({ target }), ndk);

  async function handleZap() {
    if (!ndk?.$currentPubkey) {
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
  class={cn(
    'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
    zapState.hasZapped && 'text-amber-500',
    className
  )}
  aria-label={`Zap (${zapState.totalAmount} sats)`}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill={zapState.hasZapped ? 'currentColor' : 'none'}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  {#if showCount && zapState.totalAmount > 0}
    <span class="text-sm font-medium">{zapState.totalAmount}</span>
  {/if}
</button>
