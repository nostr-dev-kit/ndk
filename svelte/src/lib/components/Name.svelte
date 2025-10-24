<!--
  @component Name - Display a user's name from their Nostr profile

  Fetches and displays a user's name or display name from their profile.
  Fallback to truncated pubkey if no name is available.

  @example
  ```svelte
  <Name {ndk} pubkey={user.pubkey} />
  <Name {ndk} pubkey={user.pubkey} field="displayName" />
  <Name {ndk} pubkey={user.pubkey} class="font-bold text-lg" />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

  interface Props {
    /** NDKSvelte instance for fetching profile data */
    ndk: NDKSvelte;
    /** The user's pubkey (hex format) */
    pubkey: string;
    /** Which field to display: 'name', 'displayName', or 'both' (defaults to 'displayName') */
    field?: 'name' | 'displayName' | 'both';
    /** Additional CSS classes for styling */
    class?: string;
  }

  let { ndk, pubkey, field = 'displayName', class: className = '' }: Props = $props();

  let profile = $state(null);

  $effect(() => {
    if (!pubkey) {
      profile = null;
      return;
    }

    const user = ndk.getUser({ pubkey });
    user.fetchProfile().then(p => profile = p);
  });

  // Compute the display text based on the field prop
  const displayText = $derived.by(() => {
    if (!profile) return `${pubkey.slice(0, 8)}...`;

    if (field === 'name') {
      return profile.name || `${pubkey.slice(0, 8)}...`;
    } else if (field === 'displayName') {
      return profile.displayName || profile.name || `${pubkey.slice(0, 8)}...`;
    } else if (field === 'both') {
      const displayName = profile.displayName || profile.name;
      const name = profile.name && profile.displayName !== profile.name ? `(${profile.name})` : '';
      return displayName ? `${displayName} ${name}`.trim() : `${pubkey.slice(0, 8)}...`;
    }

    return `${pubkey.slice(0, 8)}...`;
  });
</script>

<span class={className}>{displayText}</span>
