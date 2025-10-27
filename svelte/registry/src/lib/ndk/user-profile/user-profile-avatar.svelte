<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';

  interface Props {
    /** NDK instance (required for standalone mode) */
    ndk?: NDKSvelte;

    /** User instance (required for standalone mode) */
    user?: NDKUser;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile | null;

    /** User's pubkey (alternative to user in standalone mode) */
    pubkey?: string;

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
    profile: propProfile,
    pubkey: propPubkey,
    size = 48,
    class: className = '',
    fallback,
    alt
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

  // Use provided profile or fetch if needed
  const profileFetcher = $derived(
    propProfile !== undefined
      ? null // Don't fetch if profile was provided
      : (ndkUser && ndk ? createProfileFetcher({ ndk, user: () => ndkUser! }) : null)
  );

  const profile = $derived(propProfile !== undefined ? propProfile : profileFetcher?.profile);

  const imageUrl = $derived(profile?.picture || fallback);
  const displayName = $derived(
    alt || profile?.displayName || profile?.name || 'Anon'
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
    style="width: {size}px; height: {size}px;"
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }
</style>
