<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '../../builders/reply-action/index.svelte.js';
  import { getContext } from 'svelte';
  import { tv } from 'tailwind-variants';
  import ReplyIcon from '../../icons/reply/reply.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    showCount?: boolean;
    onclick?: () => void;
    class?: string;
  }

  let { ndk: ndkProp, event, variant = 'ghost', showCount = true, onclick, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const replyState = createReplyAction(() => ({ event }), ndk);

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
        true: 'text-primary',
        false: ''
      }
    }
  });

  function handleClick() {
    onclick?.();
  }
</script>

<button
  data-reply-button=""
  data-replied={replyState.hasReplied ? '' : undefined}
  data-variant={variant}
  onclick={handleClick}
  class={buttonStyles({ variant, active: replyState.hasReplied, class: className })}
  aria-label={`Reply (${replyState.count})`}
>
  <ReplyIcon size={16} class="flex-shrink-0" />
  {#if showCount && replyState.count > 0}
    <span class="text-sm font-medium">{replyState.count}</span>
  {/if}
</button>
