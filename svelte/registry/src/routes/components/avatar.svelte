<!--
  @component Avatar - User avatar display with fallback

  Shows user profile picture or generates a simple placeholder
  with initials.

  @example
  ```svelte
  <Avatar {ndk} {user} />

  // With pubkey
  <Avatar {ndk} pubkey="npub1..." />

  // Custom size
  <Avatar {ndk} {user} size={64} />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createProfileFetcher, type NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    user?: NDKUser;
    ndk?: NDKSvelte;
    pubkey?: string;
    size?: number;
    class?: string;
    alt?: string;
    fallback?: string;
  }

  let {
    user,
    ndk,
    pubkey,
    size = 48,
    class: className = '',
    alt,
    fallback,
  }: Props = $props();

  // Get the user instance
  const ndkUser = $derived(user || (ndk && pubkey ? ndk.getUser({ pubkey }) : null));

  // Fetch profile if we have a user
  let profileFetcher = $state<ReturnType<typeof createProfileFetcher> | null>(null);

  $effect(() => {
    if (ndkUser && ndk) {
      profileFetcher = createProfileFetcher(() => ({ user: ndkUser }), ndk);
    } else {
      profileFetcher = null;
    }
  });

  const imageUrl = $derived(profileFetcher?.profile?.picture || fallback);
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    class="avatar {className}"
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class="avatar avatar-fallback {className}"
    style="width: {size}px; height: {size}px;"
  >
    {ndkUser?.pubkey.slice(0, 2).toUpperCase()}
  </div>
{/if}

<style>
  .avatar {
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }
</style>
