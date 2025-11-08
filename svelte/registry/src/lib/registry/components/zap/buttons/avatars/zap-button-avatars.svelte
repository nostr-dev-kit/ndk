<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import { zapInvoiceFromEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../../utils/cn.js';
  import { createZapAction } from '$lib/registry/builders/zap-action/zap-action.svelte.js';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';
  import ZapIcon from '../../icons/zap.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event?: NDKEvent;
    user?: NDKUser;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    max?: number;
    avatarSize?: number;
    spacing?: 'tight' | 'normal' | 'loose';
    showCount?: boolean;
    onclick?: () => void;
    class?: string;
  }

  let {
    ndk: ndkProp,
    event,
    user,
    variant = 'ghost',
    max = 3,
    avatarSize = 24,
    spacing = 'tight',
    showCount = true,
    onclick,
    class: className = ''
  }: Props = $props();

  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ctx?.ndk || ndkContext;
  const eventFromContext = event || ctx?.event;
  const target = $derived(eventFromContext || user);

  const zapAction = createZapAction(() => ({ target }), ndk);

  const zapperPubkeys = $derived(
    Array.from(
      new Set(
        zapAction.events
          .map(zapInvoiceFromEvent)
          .filter(Boolean)
          .map(invoice => invoice!.zapper)
          .filter(Boolean)
      )
    )
  );

  function handleClick() {
    onclick?.();
  }
</script>

<button
  data-zap-button-avatars=""
  data-variant={variant}
  type="button"
  onclick={handleClick}
  class={cn(
    'inline-flex items-center gap-2 cursor-pointer transition-all',
    variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
    variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
    variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
    variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
    className
  )}
  aria-label={`${zapAction.totalAmount} sats from ${zapAction.count} ${zapAction.count === 1 ? 'zapper' : 'zappers'}`}
>
  <ZapIcon size={16} filled={zapperPubkeys.length > 0} class="flex-shrink-0" />
  {#if zapperPubkeys.length > 0}
    <AvatarGroup
      {ndk}
      pubkeys={zapperPubkeys}
      {max}
      size={avatarSize}
      {spacing}
      overflowVariant="none"
      skipCurrentUser={false}
    />
    {#if showCount && zapAction.totalAmount > 0}
      <span class="text-sm font-medium text-amber-500">
        {zapAction.totalAmount}
      </span>
    {/if}
  {:else}
    <span class="text-sm text-muted-foreground">No zaps</span>
  {/if}
</button>
