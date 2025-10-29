<!-- @ndk-version: user-profile@0.10.0 -->
<!--
  @component UserProfile.Banner
  Displays user banner image with gradient fallback.
  Must be used within UserProfile.Root context.

  @example
  ```svelte
  <UserProfile.Root {ndk} {user}>
    <UserProfile.Banner />
  </UserProfile.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';

  interface Props {
    /** Height of the banner */
    height?: string;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    height = '12rem',
    class: className = ''
  }: Props = $props();

  const context = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserProfile.Banner must be used within UserProfile.Root');
  }

  const profile = $derived(context.profile);
  const ndkUser = $derived(context.ndkUser);

  let imageLoaded = $state(false);
  let imageError = $state(false);

  // Always show gradient background
  const backgroundStyle = $derived.by(() => {
    const resolvedPubkey = ndkUser?.pubkey;
    if (resolvedPubkey) {
      return `background: ${deterministicPubkeyGradient(resolvedPubkey)}`;
    }
    return 'background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 80%, var(--foreground) 20%) 100%)';
  });

  // Reset image state when banner URL changes
  $effect(() => {
    if (profile?.banner) {
      imageLoaded = false;
      imageError = false;
    }
  });

  function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
  }

  function handleImageError() {
    imageLoaded = false;
    imageError = true;
  }

  const showImage = $derived(profile?.banner && imageLoaded && !imageError);
</script>

<div
  class="user-profile-banner {className}"
  style="{backgroundStyle}; height: {height}"
>
  {#if profile?.banner}
    <img
      src={profile.banner}
      alt="Profile banner"
      class="w-full h-full object-cover"
      class:opacity-0={!imageLoaded}
      onload={handleImageLoad}
      onerror={handleImageError}
    />
  {/if}
</div>

<style>
  .user-profile-banner {
    position: relative;
    width: 100%;
  }
</style>
