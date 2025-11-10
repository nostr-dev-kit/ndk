<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn';
  import { createZapAction } from '../../builders/zap-action/zap-action.svelte.js';
  import ZapIcon from '../../icons/zap/zap.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event?: NDKEvent;
    user?: NDKUser;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    showCount?: boolean;
    onclick?: (zapFn: (amount: number, comment?: string) => Promise<void>) => void;
    class?: string;
  }

  let { ndk: ndkProp, event, user, variant = 'ghost', showCount = true, onclick, class: className = '' }: Props = $props();

  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ctx?.ndk || ndkContext;
  const eventFromContext = event || ctx?.event;
  const target = $derived(eventFromContext || user);

  const zapAction = createZapAction(() => ({ target }), ndk);

  function handleClick() {
    onclick?.(zapAction.zap);
  }
</script>

{#if ndk && target}
  <button
    data-zap-button=""
    data-zapped={zapAction.hasZapped ? '' : undefined}
    data-variant={variant}
    onclick={handleClick}
    class={cn(
      'inline-flex items-center gap-2 cursor-pointer transition-all',
      variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
      variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
      variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
      variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
      zapAction.hasZapped && 'text-accent',
      className
    )}
    aria-label={`Zap`}
  >
    <ZapIcon size={16} filled={zapAction.hasZapped} class="flex-shrink-0" />
    {#if showCount && zapAction.totalAmount > 0}
      <span class="text-sm font-medium">{zapAction.totalAmount}</span>
    {/if}
  </button>
{/if}
