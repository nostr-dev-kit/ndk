<script lang="ts">
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Component } from 'svelte';
  import { User } from '../../../ui/user';
  import { cn } from '../../../utils/cn';

  interface Props {
    ndk: NDKSvelte;

    user?: NDKUser;

    pubkey?: string;

    profile?: NDKUserProfile;

    variant?: 'horizontal' | 'stacked' | 'inline' | 'compact';

    size?: 'xs' | 'sm' | 'md' | 'lg';

    showAvatar?: boolean;

    byline?: string | Component;

    onclick?: (e: MouseEvent) => void;

    class?: string;
  }

  let {
    ndk,
    user,
    pubkey,
    profile,
    variant = 'horizontal',
    size = 'md',
    showAvatar = true,
    byline,
    onclick,
    class: className = ''
  }: Props = $props();


  // Size-based classes
  const sizeClasses = $derived.by(() => {
    switch (size) {
      case 'xs':
        return {
          container: 'gap-2',
          avatar: 'w-6 h-6',
          name: 'text-xs',
          byline: 'text-xs'
        };
      case 'sm':
        return {
          container: 'gap-2',
          avatar: 'w-8 h-8',
          name: 'text-sm',
          byline: 'text-xs'
        };
      case 'md':
        return {
          container: 'gap-3',
          avatar: 'w-10 h-10',
          name: 'text-base',
          byline: 'text-sm'
        };
      case 'lg':
        return {
          container: 'gap-4',
          avatar: 'w-12 h-12',
          name: 'text-lg',
          byline: 'text-base'
        };
      default:
        return {
          container: 'gap-3',
          avatar: 'w-10 h-10',
          name: 'text-base',
          byline: 'text-sm'
        };
    }
  });

  // Variant-based layout classes
  const variantClasses = $derived.by(() => {
    switch (variant) {
      case 'horizontal':
        return {
          wrapper: 'flex items-center',
          info: 'flex flex-col'
        };
      case 'stacked':
        return {
          wrapper: 'flex flex-col items-center text-center',
          info: 'flex flex-col items-center'
        };
      case 'inline':
        return {
          wrapper: 'flex items-center',
          info: 'flex items-center gap-2'
        };
      case 'compact':
        return {
          wrapper: 'flex items-center',
          info: 'flex items-baseline gap-2'
        };
      default:
        return {
          wrapper: 'flex items-center',
          info: 'flex flex-col'
        };
    }
  });
</script>

<User.Root {ndk} {user} {pubkey} {profile} {onclick}>
  <div data-user-profile="" data-variant={variant} data-size={size} class={cn(variantClasses.wrapper, sizeClasses.container, className)}>
    {#if showAvatar}
      <User.Avatar class={sizeClasses.avatar} />
    {/if}

    <div class={cn(variantClasses.info, 'min-w-0')}>
      <User.Name class={cn(sizeClasses.name, 'truncate')} />

      {#if typeof byline === 'string'}
        <div class={cn(sizeClasses.byline, 'text-muted-foreground truncate')}>
          {byline}
        </div>
      {:else if byline}
        {@const BylineComponent = byline}
        <div class={cn(sizeClasses.byline, 'text-muted-foreground')}>
          <BylineComponent />
        </div>
      {/if}
    </div>
  </div>
</User.Root>
