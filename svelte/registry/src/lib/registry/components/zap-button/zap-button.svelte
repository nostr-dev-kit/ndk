<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { tv } from 'tailwind-variants';
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

  const buttonStyles = tv({
    base: 'inline-flex items-center gap-2 cursor-pointer font-medium text-sm transition-all rounded-md outline-none disabled:pointer-events-none disabled:opacity-50',
    variants: {
      variant: {
        ghost: 'px-3 py-2 hover:bg-accent hover:text-accent-foreground',
        outline: 'px-3 py-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border border-border',
        pill: 'px-4 py-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border border-border rounded-full',
        solid: 'px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
      },
      active: {
        true: 'text-accent',
        false: ''
      }
    }
  });

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
    class={buttonStyles({ variant, active: zapAction.hasZapped, class: className })}
    aria-label={`Zap`}
  >
    <ZapIcon size={16} filled={zapAction.hasZapped} class="flex-shrink-0" />
    {#if showCount && zapAction.totalAmount > 0}
      <span class="text-sm font-medium">{zapAction.totalAmount}</span>
    {/if}
  </button>
{/if}
