<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance (required for standalone mode) */
    ndk?: NDKSvelte;

    /** User instance (required for standalone mode) */
    user?: NDKUser;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile | null;

    /** Which field to display */
    field?: 'displayName' | 'name' | 'both';

    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Whether to truncate */
    truncate?: boolean;
  }

  let {
    ndk: propNdk,
    user: propUser,
    profile: propProfile,
    field = 'displayName',
    size = 'text-base',
    class: className = '',
    truncate = true
  }: Props = $props();

  // Try to get context (will be undefined if used standalone)
  const context = getContext<UserProfileContext | undefined>(USER_PROFILE_CONTEXT_KEY);

  // Resolve NDK and user from props or context
  const ndk = $derived(propNdk || context?.ndk);
  const ndkUser = $derived(propUser || context?.ndkUser);

  // Resolve pubkey for fallback display
  const userPubkey = $derived.by(() => {
    if (ndkUser) {
      try {
        return ndkUser.pubkey;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  // Use provided profile, context profile, or fetch if needed
  let profileFetcher = $state<ReturnType<typeof createProfileFetcher> | null>(null);

  $effect(() => {
    if (propProfile !== undefined || context?.profile !== undefined) {
      profileFetcher = null;
    } else if (ndkUser && ndk) {
      profileFetcher = createProfileFetcher(() => ({ user: ndkUser! }), ndk);
    } else {
      profileFetcher = null;
    }
  });

  const profile = $derived(
    propProfile !== undefined
      ? propProfile
      : context?.profile !== undefined
        ? context.profile
        : profileFetcher?.profile
  );

  const displayText = $derived.by(() => {
    if (!profile) return userPubkey?.slice(0, 8) + '...' || 'Unknown';

    if (field === 'name') {
      return profile.name || userPubkey?.slice(0, 8) + '...';
    } else if (field === 'displayName') {
      return profile.displayName || profile.name || userPubkey?.slice(0, 8) + '...';
    } else if (field === 'both') {
      const displayName = profile.displayName || profile.name;
      const name = profile.name && profile.name !== profile.displayName ? profile.name : null;
      return name ? `${displayName} (@${name})` : displayName || userPubkey?.slice(0, 8) + '...';
    }

    return userPubkey?.slice(0, 8) + '...' || 'Unknown';
  });
</script>

<span class={cn(size, truncate && 'truncate inline-block max-w-full', className)}>
  {displayText}
</span>
