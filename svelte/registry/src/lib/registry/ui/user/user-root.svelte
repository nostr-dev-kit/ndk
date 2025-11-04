<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import type { Snippet } from 'svelte';
  import { cn } from "../../utils/cn.js";

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
  const context = {
    get ndk() { return ndk; },
    get user() { return user; },
    get ndkUser() { return ndkUser; },
    get profile() { return profile; },
    get onclick() { return onclick; }
  };

  setContext(USER_CONTEXT_KEY, context);
</script>

<div class={cn("contents", className)}>
  {@render children()}
</div>
