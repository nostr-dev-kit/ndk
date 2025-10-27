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

    /** User's pubkey (alternative to user in standalone mode) */
    pubkey?: string;

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
    pubkey: propPubkey,
    field = 'displayName',
    size = 'text-base',
    class: className = '',
    truncate = true
  }: Props = $props();

  // Try to get context (will be null if used standalone)
  const context = getContext<UserProfileContext | null>(USER_PROFILE_CONTEXT_KEY, { optional: true });

  // Resolve NDK and user from props or context
  const ndk = $derived(propNdk || context?.ndk);
  const ndkUser = $derived(
    propUser ||
    context?.ndkUser ||
    (ndk && propPubkey ? ndk.getUser({ pubkey: propPubkey }) : null)
  );

  // Resolve pubkey for fallback display
  const userPubkey = $derived.by(() => {
    if (propPubkey) return propPubkey;
    if (context?.pubkey) return context.pubkey;
    if (ndkUser) {
      try {
        return ndkUser.pubkey;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  // Use provided profile or fetch if needed
  const profileFetcher = $derived(
    propProfile !== undefined
      ? null // Don't fetch if profile was provided
      : (ndkUser && ndk ? createProfileFetcher({ ndk, user: () => ndkUser! }) : null)
  );

  const profile = $derived(propProfile !== undefined ? propProfile : profileFetcher?.profile);

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

<span class={cn('user-profile-name', size, truncate && 'user-profile-name-truncate', className)}>
  {displayText}
</span>

<style>
  .user-profile-name {
    color: var(--foreground, #111827);
  }

  .user-profile-name-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
  }
</style>
