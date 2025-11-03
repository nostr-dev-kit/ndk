<!-- @ndk-version: user-card-neon@0.5.0 -->
<!--
  @component UserCard.Neon
  Neon-style user card with full background image and glossy top border

  Features a full background image with darkening gradient and a neon glow effect
  at the top border using radial gradients and layered inset shadows.

  @example
  ```svelte
  <UserCard.Neon {ndk} {pubkey} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '../../ui/index.js';
  import { cn } from '../../utils/index.js';
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from '../../ui/user/context.svelte.js';
  import FollowButtonAnimated from '../actions/follow-button-animated.svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User's pubkey */
    pubkey: string;

    /** Card width (default: w-[320px]) */
    width?: string;

    /** Card height (default: h-[480px]) */
    height?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    pubkey,
    width = 'w-[320px]',
    height = 'h-[480px]',
    onclick,
    class: className = ''
  }: Props = $props();

  const baseClasses = cn(
    'user-card-neon',
    'group relative flex flex-col flex-shrink-0 overflow-hidden rounded-2xl',
    'text-left',
    width,
    height,
    className
  );

  const interactiveClasses = onclick ? 'cursor-pointer' : '';
</script>

<User.Root {ndk} {pubkey}>
  {@const context = getContext<UserContext>(USER_CONTEXT_KEY)}
  {@const imageUrl = context.profile?.banner}
  {@const user = context.ndkUser}
  {@const isOwnProfile = user && ndk.$currentPubkey === user.pubkey}

  <svelte:element
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    {onclick}
    class={cn(baseClasses, interactiveClasses)}
  >
    <!-- Glossy neon top border effect -->
    <div class={cn("neon-border z-1", width, height)}></div>

    <!-- Full Background Image -->
    <div class="absolute inset-0 z-1 m-[1px]">
      {#if imageUrl}
        <img
          src={imageUrl}
          alt={context.profile?.displayName || context.profile?.name || 'User banner'}
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <!-- Modern darkening gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90"></div>
      {:else}
        <!-- Fallback gradient background -->
        <div class="w-full h-full bg-gradient-to-br from-muted via-muted-foreground to-foreground"></div>
      {/if}
    </div>

    <!-- Content Overlay -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8 text-center">
      <div class="flex flex-col items-center w-full max-w-[280px]">
        <!-- Avatar with ring effect -->
        <User.Avatar class="w-24 h-24 ring-4 ring-white/20 mb-4" />

        <!-- Name -->
        <User.Name field="displayName" class="text-2xl font-bold text-white leading-tight line-clamp-1" />
        <User.Field field="name" class="text-sm text-white/70 leading-relaxed line-clamp-1 mt-1 mb-4" />

        <!-- Bio -->
        <User.Field field="about" class="text-sm text-white/80 leading-relaxed line-clamp-3 mb-6" maxLines={3} />

        <!-- Stats -->
        <div class="w-full border-t border-white/20 pt-4 mb-6">
          <div class="flex items-center justify-center gap-8">
            <div class="flex flex-col items-center">
              <span class="text-xl font-bold text-white">234</span>
              <span class="text-xs text-white/70 uppercase tracking-wide">notes</span>
            </div>
            <div class="w-px h-8 bg-white/20"></div>
            <div class="flex flex-col items-center">
              <span class="text-xl font-bold text-white">1.5K</span>
              <span class="text-xs text-white/70 uppercase tracking-wide">followers</span>
            </div>
          </div>
        </div>

        <!-- Follow Button -->
        {#if user}
          <FollowButtonAnimated {ndk} target={user} class="!bg-white/10 !backdrop-blur-sm !text-white !border !border-white/20 hover:!bg-white [&:hover_*]:!text-black !rounded-full" />
        {/if}
      </div>
    </div>
  </svelte:element>
</User.Root>

<style>
  .neon-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: radial-gradient(
      ellipse at top,
      color-mix(in srgb, white 40%, transparent) 0%,
      color-mix(in srgb, white 15%, transparent) 50%,
      transparent 100%
    );

  }
</style>
