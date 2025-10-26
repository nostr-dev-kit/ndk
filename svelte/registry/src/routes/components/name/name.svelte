<!--
  @component Name - Display a user's name from their Nostr profile

  Fetches and displays a user's name or display name from their profile.
  Fallback to truncated pubkey if no name is available.

  @example
  ```svelte
  <Name {ndk} {user} />

  // Show username instead of display name
  <Name {ndk} {user} field="name" />

  // Show both display name and username
  <Name {ndk} {user} field="both" />

  // With custom styling
  <Name {ndk} {user} class="font-bold text-lg" />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createProfileFetcher, type NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    user?: NDKUser;
    ndk?: NDKSvelte;
    pubkey?: string;
    field?: 'name' | 'displayName' | 'both';
    class?: string;
    as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }

  let {
    user,
    ndk,
    pubkey,
    field = 'displayName',
    class: className = '',
    as: Element = 'span'
  }: Props = $props();

  const ndkUser = $derived(user || (ndk && pubkey ? ndk.getUser({ pubkey }) : null));

  const profileFetcher = $derived(
    ndkUser && ndk ? createProfileFetcher({ ndk, user: ndkUser }) : null
  );

  const displayText = $derived(() => {
    if (!profileFetcher?.profile) return ndkUser?.npub.slice(0, 8) + '...' || 'Unknown';

    const profile = profileFetcher.profile;

    if (field === 'name') {
      return profile.name || ndkUser?.npub.slice(0, 8) + '...';
    } else if (field === 'displayName') {
      return profile.displayName || profile.name || ndkUser?.npub.slice(0, 8) + '...';
    } else if (field === 'both') {
      const displayName = profile.displayName || profile.name;
      const name = profile.name && profile.name !== profile.displayName ? profile.name : null;
      return name ? `${displayName} (@${name})` : displayName || ndkUser?.npub.slice(0, 8) + '...';
    }

    return ndkUser?.npub.slice(0, 8) + '...' || 'Unknown';
  });
</script>

<Element class="ndk-name {className}">
  {displayText}
</Element>

<style>
  .ndk-name {
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    word-break: break-word;
  }

  /* Truncate long names by default */
  .ndk-name:not(.ndk-name--no-truncate) {
    max-width: 20ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }

  /* Allow full names with modifier class */
  .ndk-name--full {
    max-width: none;
    white-space: normal;
  }

  /* Loading state */
  .ndk-name--loading {
    background: var(--ndk-bg-secondary, hsl(0 0% 96.1%));
    border-radius: var(--ndk-radius-sm, 0.375rem);
    animation: pulse 2s infinite;
    min-width: 5ch;
    display: inline-block;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* When used in headings */
  :is(h1, h2, h3, h4, h5, h6).ndk-name {
    font-weight: 600;
  }

  /* When used in links */
  a .ndk-name {
    text-decoration: inherit;
    color: inherit;
  }

  a:hover .ndk-name {
    text-decoration: underline;
  }
</style>