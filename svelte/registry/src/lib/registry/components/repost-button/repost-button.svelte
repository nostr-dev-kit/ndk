<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '../../builders/repost-action/index.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn';
  import RepostIcon from '../../icons/repost/repost.svelte';
  import { LinkPreview } from 'bits-ui';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    showCount?: boolean;
    onclick?: () => void;
    onquote?: () => void;
    openDelay?: number;
    closeDelay?: number;
    class?: string;
  }

  let {
    ndk: ndkProp,
    event,
    variant = 'ghost',
    showCount = true,
    onclick,
    onquote,
    openDelay = 200,
    closeDelay = 300,
    class: className = ''
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const repostState = createRepostAction(() => ({ event }), ndk);

  let isOpen = $state(false);

  const hasDropdown = $derived(!!onquote);

  async function handleRepost() {
    if (!ndk?.$currentPubkey) return;
    try {
      await repostState.repost();
      isOpen = false;
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  }

  function handleQuote() {
    onquote?.();
    isOpen = false;
  }

  function handleClick() {
    if (onclick) {
      onclick();
    } else if (!hasDropdown) {
      handleRepost();
    }
  }
</script>

{#if hasDropdown}
  <LinkPreview.Root bind:open={isOpen} {openDelay} {closeDelay}>
    <LinkPreview.Trigger
      data-repost-button=""
      data-reposted={repostState.hasReposted ? '' : undefined}
      data-variant={variant}
      data-dropdown=""
      class={cn(
        'inline-flex items-center gap-2 cursor-pointer transition-all',
        variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
        variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
        variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
        variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
        repostState.hasReposted && 'text-green-500',
        className
      )}
      aria-label={`Repost (${repostState.count})`}
    >
      <RepostIcon size={16} class="flex-shrink-0" />
      {#if showCount && repostState.count > 0}
        <span class="text-sm font-medium">{repostState.count}</span>
      {/if}
    </LinkPreview.Trigger>
    <LinkPreview.Content
      class="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
      align="start"
      sideOffset={4}
    >
      <button
        type="button"
        onclick={handleRepost}
        class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        <RepostIcon size={14} class="mr-2" />
        Repost
      </button>
      <button
        type="button"
        onclick={handleQuote}
        class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        <svg
          class="mr-2 h-3.5 w-3.5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
        </svg>
        Quote
      </button>
    </LinkPreview.Content>
  </LinkPreview.Root>
{:else}
  <button
    data-repost-button=""
    data-reposted={repostState.hasReposted ? '' : undefined}
    data-variant={variant}
    onclick={handleClick}
    class={cn(
      'inline-flex items-center gap-2 cursor-pointer transition-all',
      variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
      variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
      variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
      variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
      repostState.hasReposted && 'text-green-500',
      className
    )}
    aria-label={`Repost (${repostState.count})`}
  >
    <RepostIcon size={16} class="flex-shrink-0" />
    {#if showCount && repostState.count > 0}
      <span class="text-sm font-medium">{repostState.count}</span>
    {/if}
  </button>
{/if}
