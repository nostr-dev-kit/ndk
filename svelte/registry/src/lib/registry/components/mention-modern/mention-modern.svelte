<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UserCardClassic from '../user-card-classic/user-card-classic.svelte';

  export let hoverComponent: Component<{ ndk: NDKSvelte; pubkey: string; class?: string; }> = UserCardClassic;
</script>

<script lang="ts">
  import { getContext } from 'svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { User } from '../../ui/user';
  import { Popover } from 'bits-ui';
  import { cn } from '../../utils/cn';
  import { ENTITY_CLICK_CONTEXT_KEY, type EntityClickContext } from '../../ui/entity-click-context.js';

  interface Props {
    ndk: NDKSvelte;

    bech32: string;

    class?: string;
  }

  let {
    ndk,
    bech32,
    class: className = ''
  }: Props = $props();

  const entityClickContext = getContext<EntityClickContext | undefined>(ENTITY_CLICK_CONTEXT_KEY);
  const profileFetcher = createProfileFetcher(() => ({ user: bech32 }), ndk);
  const pubkey = $derived(profileFetcher.user?.pubkey);

  let open = $state(false);
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleMouseEnter() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      open = true;
    }, 200);
  }

  function handleMouseLeave() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      open = false;
    }, 150);
  }

  function handleClick(e: MouseEvent | KeyboardEvent) {
    if (entityClickContext?.onUserClick && pubkey) {
      e.stopPropagation();
      entityClickContext.onUserClick(pubkey);
    }
  }
</script>

{#if profileFetcher?.loading}
  <span class={cn('inline-flex items-center gap-1 text-primary', className)}>
    @{bech32.slice(0, 8)}...
  </span>
{:else if pubkey}
  <Popover.Root bind:open>
    <Popover.Trigger
      data-mention-modern=""
      class="inline-flex items-center"
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
    >
      <User.Root {ndk} {pubkey}>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <span
          class={cn(
            'items-center gap-1.5 text-primary hover:underline cursor-pointer transition-all',
            className
          )}
          onclick={handleClick}
          onkeydown={(e) => e.key === 'Enter' && handleClick(e)}
          role={entityClickContext?.onUserClick ? "button" : undefined}
          tabindex={entityClickContext?.onUserClick ? 0 : undefined}
        >
          <User.Avatar class="w-5 h-5 inline-block" />
          <span>@<User.Name class="inline" field="name" /></span>
        </span>
      </User.Root>
    </Popover.Trigger>
    <Popover.Content
      class="z-50"
      sideOffset={8}
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
    >
      {@const HoverCard = hoverComponent}
      <HoverCard {ndk} {pubkey} />
    </Popover.Content>
  </Popover.Root>
{/if}