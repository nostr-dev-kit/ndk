<!-- @ndk-version: repost-button-pill@0.1.0 -->
<!--
  @component RepostButtonPill
  Pill-style repost button block using createRepostAction builder.
  Rounded button with background, border, and hover states.

  @example
  ```svelte
  <RepostButtonPill {ndk} {event} />
  <RepostButtonPill {ndk} {event} variant="outline" />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../utils/index.js';
  import RepostIcon from '../icons/repost.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'solid' | 'outline';
    showCount?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, event, variant = 'solid', showCount = true, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const repostState = createRepostAction(() => ({ event }), ndk);

  async function handleRepost() {
    if (!ndk?.$currentPubkey) return;
    try {
      await repostState.repost();
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  }
</script>

<button
  onclick={handleRepost}
  class={cn(
    'inline-flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all',
    variant === 'solid' && 'bg-muted border border-border hover:bg-accent',
    variant === 'outline' && 'bg-transparent border border-border hover:bg-muted',
    repostState.hasReposted && variant === 'solid' && 'bg-green-500/10 border-green-500/20 text-green-600',
    repostState.hasReposted && variant === 'outline' && 'border-green-500 text-green-600',
    className
  )}
  aria-label={`Repost (${repostState.count})`}
>
  <RepostIcon size={16} class="flex-shrink-0" />
  {#if showCount && repostState.count > 0}
    <span class="text-sm font-medium">{repostState.count}</span>
  {/if}
</button>
