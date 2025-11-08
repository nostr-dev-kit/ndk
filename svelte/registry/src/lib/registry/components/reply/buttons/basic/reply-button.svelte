<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '$lib/registry/builders/reply-action.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '../../../utils/cn.js';
  import ReplyIcon from '../../icons/reply.svelte';

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

  function handleClick() {
    onclick?.();
  }
</script>

<button
  data-reply-button=""
  data-replied={replyState.hasReplied ? '' : undefined}
  data-variant={variant}
  onclick={handleClick}
  class={cn(
    'inline-flex items-center gap-2 cursor-pointer transition-all',
    variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
    variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
    variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
    variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
    replyState.hasReplied && 'text-primary',
    className
  )}
  aria-label={`Reply (${replyState.count})`}
>
  <ReplyIcon size={16} class="flex-shrink-0" />
  {#if showCount && replyState.count > 0}
    <span class="text-sm font-medium">{replyState.count}</span>
  {/if}
</button>
