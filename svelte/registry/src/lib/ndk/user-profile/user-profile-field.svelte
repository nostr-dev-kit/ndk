<script lang="ts">
  /**
   * @component UserProfile.Field
   * Displays any field from a user's Nostr profile (about, website, nip05, etc.).
   *
   * Supports both context mode (within UserProfile.Root) and standalone mode (with direct props).
   * Renders nothing if the field has no data.
   *
   * Note: When field="about", this component delegates to UserProfile.Bio for better styling.
   */
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';
  import Bio from './user-profile-bio.svelte';

  interface Props {
    /** NDK instance (required for standalone mode) */
    ndk?: NDKSvelte;

    /** User instance (required for standalone mode) */
    user?: NDKUser;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile | null;

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
    field,
    size = 'text-sm',
    class: className = '',
    maxLines
  }: Props = $props();

  // Try to get context (will be undefined if used standalone)
  const context = getContext<UserProfileContext | undefined>(USER_PROFILE_CONTEXT_KEY);

  // Resolve NDK and user from props or context
  const ndk = $derived(propNdk || context?.ndk);
  const ndkUser = $derived(propUser || context?.ndkUser);

  // Use provided profile, context profile, or fetch if needed
  const profileFetcher = $derived(
    propProfile !== undefined || context?.profile !== undefined
      ? null // Don't fetch if profile was provided via prop or context
      : (ndkUser && ndk ? createProfileFetcher(() => ({ user: ndkUser! }), ndk) : null)
  );

  const profile = $derived(
    propProfile !== undefined
      ? propProfile
      : context?.profile !== undefined
        ? context.profile
        : profileFetcher?.profile
  );

  const fieldValue = $derived(profile?.[field]);
</script>

{#if field === 'about' && context}
  <Bio {size} class={className} {maxLines} />
{:else if fieldValue}
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
