<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import { getNDKFromContext } from '../ndk-context.svelte.js';
  import HoverCard from './user-profile-hover-card.svelte';
  import * as Popover from 'bits-ui';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** User instance */
    user?: NDKUser;

    /** User's pubkey (alternative to user) */
    pubkey?: string;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile;

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
    ndk: providedNdk,
    user,
    pubkey,
    profile: propProfile,
    showHoverCard = false,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

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

  // Fetch profile if not provided (reactive to ndkUser changes)
  const profileFetcher = $derived(
    propProfile !== undefined
      ? null
      : (ndkUser ? createProfileFetcher(() => ({ user: ndkUser! }), ndk) : null)
  );

  const profile = $derived(propProfile !== undefined ? propProfile : profileFetcher?.profile);

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get user() { return user; },
    get ndkUser() { return ndkUser; },
    get profile() { return profile; },
    get showHoverCard() { return showHoverCard; },
    get onclick() { return onclick; }
  };

  setContext(USER_PROFILE_CONTEXT_KEY, context);
</script>

{#if showHoverCard && resolvedPubkey}
  <Popover.Root openDelay={500} closeDelay={100}>
    <Popover.Trigger class="user-profile-root {className}">
      {@render children()}
    </Popover.Trigger>
    <Popover.Content>
      <HoverCard {ndk} pubkey={resolvedPubkey} />
    </Popover.Content>
  </Popover.Root>
{:else}
  <div class="user-profile-root {className}">
    {@render children()}
  </div>
{/if}

<style>
  .user-profile-root {
    display: inline-block;
  }
</style>
