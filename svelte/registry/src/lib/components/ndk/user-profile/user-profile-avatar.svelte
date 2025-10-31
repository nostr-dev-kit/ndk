<!-- @ndk-version: user-profile@0.15.0 -->
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
      : 'var(--color-primary)'
  );
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    alt={displayName}
    class="rounded-full object-cover block shrink-0 {className}"
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class="rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0 {className}"
    style="width: {size}px; height: {size}px; background: {avatarGradient}; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);"
  >
    {displayName.slice(0, 2).toUpperCase()}
  </div>
{/if}
