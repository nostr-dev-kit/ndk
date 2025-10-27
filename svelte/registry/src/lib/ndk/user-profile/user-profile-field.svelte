<!--
  @component UserProfile.Field
  Displays any field from a user's Nostr profile (about, website, nip05, etc.).

  Supports both context mode (within UserProfile.Root) and standalone mode (with direct props).
  Renders nothing if the field has no data.

  @example
  ```svelte
  <!-- Context mode -->
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Field field="about" />
    <UserProfile.Field field="website" />
    <UserProfile.Field field="nip05" />
  </UserProfile.Root>

  <!-- Standalone mode -->
  <UserProfile.Field {ndk} {user} field="about" />
  <UserProfile.Field {ndk} {user} {profile} field="website" />
  ```
-->
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

    /** Which profile field to display */
    field: keyof NDKUserProfile;

    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Max number of lines to show (line-clamp) */
    maxLines?: number;
  }

  let {
    ndk: propNdk,
    user: propUser,
    profile: propProfile,
    pubkey: propPubkey,
    field,
    size = 'text-sm',
    class: className = '',
    maxLines
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

  const fieldValue = $derived(profile?.[field]);
</script>

{#if fieldValue}
  <span
    class={cn('user-profile-field', size, className)}
    style:display={maxLines ? '-webkit-box' : undefined}
    style:-webkit-line-clamp={maxLines}
    style:-webkit-box-orient={maxLines ? 'vertical' : undefined}
  >
    {fieldValue}
  </span>
{/if}

<style>
  .user-profile-field {
    color: var(--muted-foreground, #6b7280);
    overflow: hidden;
    line-height: 1.5;
  }
</style>
