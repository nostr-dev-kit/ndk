<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';
  import {cn} from "../../utils/cn.js";
  import type { Snippet } from 'svelte';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Fallback image URL */
    fallback?: string;

    /** Alt text for image */
    alt?: string;

    /** Custom fallback snippet to replace the default gradient */
    customFallback?: Snippet;
  }

  let {
    class: className = '',
    fallback,
    alt,
    customFallback
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Avatar must be used within User.Root');
  }

  const imageUrl = $derived(context.profile?.picture || fallback);
  const displayName = $derived(
    alt || context.profile?.displayName || context.profile?.name || 'NA'
  );

  const avatarGradient = $derived(
    context.ndkUser?.pubkey
      ? deterministicPubkeyGradient(context.ndkUser.pubkey)
      : 'var(--primary)'
  );

  let imageLoaded = $state(false);
  let imageError = $state(false);

  function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
  }

  function handleImageError() {
    imageLoaded = false;
    imageError = true;
  }

  $effect(() => {
    // Reset loading state when imageUrl changes
    imageLoaded = false;
    imageError = false;
  });
</script>

<div class={cn("rounded-full relative w-12 h-12", className)}>
  <!-- Fallback layer (always visible until image loads) -->
  {#if !imageLoaded || !imageUrl}
    {#if customFallback}
      {@render customFallback()}
    {:else}
      <div
        class="rounded-full flex items-center justify-center w-full h-full absolute inset-0"
        style="background: {avatarGradient};"
      >
        {displayName.slice(0, 2).toUpperCase()}
      </div>
    {/if}
  {/if}

  <!-- Image layer (only visible when loaded) -->
  {#if imageUrl}
    <img
      src={imageUrl}
      alt={displayName}
      class={cn(
        "rounded-full object-cover block w-full h-full absolute inset-0",
        imageLoaded ? "opacity-100" : "opacity-0"
      )}
      onload={handleImageLoad}
      onerror={handleImageError}
    />
  {/if}
</div>
