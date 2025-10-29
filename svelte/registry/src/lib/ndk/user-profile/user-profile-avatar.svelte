<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher, deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';

  interface Props {
    /** NDK instance (required for standalone mode) */
    ndk?: NDKSvelte;

    /** User instance (required for standalone mode) */
    user?: NDKUser;

    /** User's pubkey (alternative to user, for standalone mode) */
    pubkey?: string;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile | null;

    /** Size in pixels */
    size?: number;

    /** Additional CSS classes */
    class?: string;

    /** Fallback image URL */
    fallback?: string;

    /** Alt text for image */
    alt?: string;
  }

  let {
    ndk: propNdk,
    user: propUser,
    pubkey: propPubkey,
    profile: propProfile,
    size = 48,
    class: className = '',
    fallback,
    alt
  }: Props = $props();

  // Try to get context (will be undefined if used standalone)
  const context = getContext<UserProfileContext | undefined>(USER_PROFILE_CONTEXT_KEY);

  // Resolve NDK and user from props or context
  const ndk = $derived(propNdk || context?.ndk);
  const ndkUser = $derived(
    propUser ||
    context?.ndkUser ||
    (propPubkey && ndk ? ndk.getUser({ pubkey: propPubkey }) : undefined)
  );

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

  const imageUrl = $derived(profile?.picture || fallback);
  const displayName = $derived(
    alt || profile?.displayName || profile?.name || 'Anon'
  );

  const avatarGradient = $derived(
    ndkUser?.pubkey
      ? deterministicPubkeyGradient(ndkUser.pubkey)
      : 'var(--primary)'
  );
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    alt={displayName}
    class="user-profile-avatar {className}"
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class="user-profile-avatar user-profile-avatar-fallback {className}"
    style="width: {size}px; height: {size}px; background: {avatarGradient};"
  >
    {displayName.slice(0, 2).toUpperCase()}
  </div>
{/if}

<style>
  .user-profile-avatar {
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .user-profile-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-foreground);
    font-weight: 600;
    font-size: 0.875rem;
    text-shadow: 0 1px 2px color-mix(in srgb, var(--foreground) 30%, transparent);
  }
</style>
