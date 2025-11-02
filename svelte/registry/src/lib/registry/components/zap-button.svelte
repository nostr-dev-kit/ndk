<!--
  @component ZapButton
  Standalone zap button component combining send and display functionality.
-->
<script lang="ts">
  import { NDKEvent, type NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../utils/index.js';
  import * as ZapSend from './zap-send/index.js';
  import * as Zaps from './zaps/index.js';

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
  let ndk = $derived(ndkProp || ctx?.ndk);
  let event = $derived(eventProp || ctx?.event);
  let target = $derived(event || user);
</script>

{#if ndk && target}
  <Zaps.Root {ndk} {event} {user}>
    {#snippet children(zaps, stats)}
      <ZapSend.Root {ndk} recipient={target}>
        {#snippet children({ send })}
          <button
            use:send={{ amount }}
            class={cn(
              'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
              stats.count > 0 && 'text-amber-500',
              className
            )}
            aria-label={`Zap (${stats.total} sats)`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill={stats.count > 0 ? 'currentColor' : 'none'}>
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {#if showCount && stats.total > 0}
              <span class="text-sm font-medium">{stats.total}</span>
            {/if}
          </button>
        {/snippet}
      </ZapSend.Root>
    {/snippet}
  </Zaps.Root>
{/if}
