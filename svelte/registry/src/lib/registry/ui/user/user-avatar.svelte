<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';

  interface Props {
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
    size = 48,
    class: className = '',
    fallback,
    alt
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Avatar must be used within User.Root');
  }

  const { ndkUser, profile } = context;

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
    class="rounded-full object-cover block {className}"
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class="rounded-full flex items-center justify-center {className}"
    style="width: {size}px; height: {size}px; background: {avatarGradient};"
  >
    {displayName.slice(0, 2).toUpperCase()}
  </div>
{/if}
