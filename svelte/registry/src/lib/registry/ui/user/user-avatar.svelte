<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';
  import {cn} from "../../utils/cn.js";

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Fallback image URL */
    fallback?: string;

    /** Alt text for image */
    alt?: string;
  }

  let {
    class: className = '',
    fallback,
    alt
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
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    alt={displayName}
    class={cn("rounded-full object-cover block w-12 h-12", className)}
  />
{:else}
  <div
    class={cn("rounded-full flex items-center justify-center w-12 h-12", className)}
    style="background: {avatarGradient};"
  >
    {displayName.slice(0, 2).toUpperCase()}
  </div>
{/if}
