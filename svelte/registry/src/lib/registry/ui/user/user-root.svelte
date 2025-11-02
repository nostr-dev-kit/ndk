<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (required) */
    ndk: NDKSvelte;

    /** User instance */
    user?: NDKUser;

    /** User's pubkey (alternative to user) */
    pubkey?: string;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile;

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
    profile: propProfile,
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

  // Fetch profile if not provided (reactive to ndkUser changes)
  let profileFetcher = $state<ReturnType<typeof createProfileFetcher> | null>(null);

  $effect(() => {
    if (propProfile !== undefined) {
      profileFetcher = null;
    } else if (ndkUser) {
      profileFetcher = createProfileFetcher(() => ({ user: ndkUser! }), ndk);
    } else {
      profileFetcher = null;
    }
  });

  const profile = $derived(propProfile !== undefined ? propProfile : profileFetcher?.profile);

  // Create reactive context using $state.raw() to preserve reactivity
  const context = $state.raw({
    get ndk() { return ndk; },
    get user() { return user; },
    get ndkUser() { return ndkUser; },
    get profile() { return profile; },
    get showHoverCard() { return false; },
    get onclick() { return onclick; }
  });

  setContext(USER_CONTEXT_KEY, context);
</script>

<div class="{className}">
  {@render children()}
</div>
