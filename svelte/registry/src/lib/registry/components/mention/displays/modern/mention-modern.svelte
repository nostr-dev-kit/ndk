<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui/user';
  import UserCardClassic from '$lib/registry/components/user/cards/classic/user-card-classic.svelte';
  import { Popover } from 'bits-ui';
  import { cn } from '$lib/registry/utils/cn';

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
        <span class={cn(
          'items-center gap-1.5 text-primary hover:underline cursor-pointer transition-all',
          className
        )}>
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
      <UserCardClassic {ndk} {pubkey} />
    </Popover.Content>
  </Popover.Root>
{/if}