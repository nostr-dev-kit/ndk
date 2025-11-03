<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
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

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Banner must be used within User.Root');
  }

  const profile = $derived(context.profile);
  const ndkUser = $derived(context.ndkUser);

  let imageLoaded = $state(false);
  let imageError = $state(false);

  const backgroundStyle = $derived.by(() => {
    const resolvedPubkey = ndkUser?.pubkey;
    if (resolvedPubkey) {
      return `background: ${deterministicPubkeyGradient(resolvedPubkey)}`;
    }
    return 'background: var(--primary)';
  });

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
  class="relative w-full {className}"
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
