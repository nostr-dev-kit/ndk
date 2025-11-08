<script lang="ts">
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { User } from '$lib/registry/ui/user';

  interface Props {
    ndk: NDKSvelte;

    user?: NDKUser;

    pubkey?: string;

    profile?: NDKUserProfile;

    avatarClass?: string;

    meta?: 'handle' | 'about' | string | Snippet;

    onclick?: (e: MouseEvent) => void;

    class?: string;
  }

  let {
    ndk,
    user,
    pubkey,
    profile,
    avatarClass = '',
    meta,
    onclick,
    class: className = ''
  }: Props = $props();
</script>

<User.Root {ndk} {user} {pubkey} {profile} {onclick}>
  <div data-user-avatar-name="" data-meta={meta ? '' : undefined} class="flex items-center gap-3 {className}">
    <User.Avatar class={avatarClass} />
    {#if meta}
      <div class="flex flex-col">
        <User.Name />
        <div class="text-xs">
          {#if meta === 'handle'}
            <User.Handle />
          {:else if meta === 'about'}
            <User.Bio class="line-clamp-1" />
          {:else if typeof meta === 'string'}
            {meta}
          {:else}
            {@render meta()}
          {/if}
        </div>
      </div>
    {:else}
      <User.Name />
    {/if}
  </div>
</User.Root>
