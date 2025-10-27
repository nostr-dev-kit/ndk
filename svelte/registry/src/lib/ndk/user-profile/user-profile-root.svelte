<!--
  @component UserProfile.Root
  Root container that provides context for UserProfile subcomponents.

  Fetches the user's profile once and shares it via context to all child components.
  The profile fetcher is reactive - child components automatically update when the profile loads.

  @example
  ```svelte
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Avatar />
    <UserProfile.Name />
  </UserProfile.Root>
  ```

  @example With hover card:
  ```svelte
  <UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
    <UserProfile.Avatar />
    <UserProfile.Name />
  </UserProfile.Root>
  ```
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import HoverCard from './user-profile-hover-card.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User instance */
    user?: NDKUser;

    /** User's pubkey (alternative to user) */
    pubkey?: string;

    /** Show hover card on mouse enter */
    showHoverCard?: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children: Snippet;
  }

  let {
    ndk,
    user,
    pubkey,
    showHoverCard = false,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  // Resolve NDKUser from either user prop or pubkey
  const ndkUser = $derived.by(() => {
    if (user) return user;
    if (pubkey) {
      try {
        return ndk.getUser({ pubkey });
      } catch {
        return null;
      }
    }
    return null;
  });

  const resolvedPubkey = $derived.by(() => {
    if (pubkey) return pubkey;
    if (ndkUser) {
      try {
        return ndkUser.pubkey || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  // Fetch profile (reactive to ndkUser changes)
  const profileFetcher = $derived(
    ndkUser ? createProfileFetcher({ ndk, user: () => ndkUser! }) : null
  );

  // Hover card state
  let isHoverCardVisible = $state(false);
  let hoverCardPosition = $state({ x: 0, y: 0 });
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let containerRef: HTMLDivElement | null = null;

  function handleMouseEnter(e: MouseEvent) {
    if (!showHoverCard || !resolvedPubkey) return;

    // Clear any existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    // Show hover card after 500ms delay
    hoverTimer = setTimeout(() => {
      if (containerRef) {
        const rect = containerRef.getBoundingClientRect();
        const x = rect.left;
        const y = rect.top;

        hoverCardPosition = { x, y };
        isHoverCardVisible = true;
      }
    }, 500);
  }

  function handleMouseLeave() {
    if (!showHoverCard) return;

    // Clear show timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    // Hide after 100ms delay (allows moving to hover card)
    hoverTimer = setTimeout(() => {
      isHoverCardVisible = false;
    }, 100);
  }

  function handleHoverCardMouseEnter() {
    // Cancel hide timer when entering hover card
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
  }

  function handleHoverCardMouseLeave() {
    isHoverCardVisible = false;
  }

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get user() { return user; },
    get pubkey() { return pubkey; },
    get ndkUser() { return ndkUser; },
    get profileFetcher() { return profileFetcher; },
    get showHoverCard() { return showHoverCard; },
    get onclick() { return onclick; }
  };

  setContext(USER_PROFILE_CONTEXT_KEY, context);
</script>

<div
  bind:this={containerRef}
  class="user-profile-root {className}"
  class:has-hover-card={showHoverCard}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  {@render children()}
</div>

{#if showHoverCard && resolvedPubkey}
  <div
    onmouseenter={handleHoverCardMouseEnter}
    onmouseleave={handleHoverCardMouseLeave}
  >
    <HoverCard
      {ndk}
      pubkey={resolvedPubkey}
      isVisible={isHoverCardVisible}
      position={hoverCardPosition}
    />
  </div>
{/if}

<style>
  .user-profile-root {
    display: contents;
  }

  .user-profile-root.has-hover-card {
    display: inline-block;
  }
</style>
