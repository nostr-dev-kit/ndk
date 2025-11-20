<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';

  interface Props {
    class?: string;
  }

  let {
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
  data-user-banner=""
  class="relative w-full h-48 {className}"
  style="{backgroundStyle}"
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
