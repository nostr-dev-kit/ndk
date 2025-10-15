<!--
  @component MentionPreview - Default renderer for user mentions (npub/nprofile)

  Shows:
  - User avatar
  - Display name or truncated pubkey

  @example
  ```svelte
  <MentionPreview
    {ndk}
    bech32="npub1..."
    onClick={(bech32) => goto(`/p/${bech32}`)}
  />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/ndk';
  import Avatar from '../Avatar.svelte';

  interface Props {
    /** NDKSvelte instance for fetching user data */
    ndk: NDKSvelte;
    /** The bech32-encoded user reference (npub or nprofile) */
    bech32: string;
    /** Callback when the mention is clicked */
    onClick?: (bech32: string) => void;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    bech32,
    onClick,
    class: className = '',
  }: Props = $props();

  const user = ndk.$fetchUser(() => bech32);
  const profile = ndk.$fetchProfile(() => user?.pubkey);

  // Get display name
  const displayName = $derived.by(() => {
    if (profile?.displayName) return profile.displayName.slice(0, 48);
    if (profile?.name) return profile.name.slice(0, 48);
    return `${bech32.slice(0, 12)}...`;
  });

  // Handle click
  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(bech32);
    }
  }
</script>

{#if !user?.pubkey}
  <!-- Loading state -->
  <span class="mention-inline {className}">{bech32.slice(0 ,12)}</span>
{:else}
  <a
    href={`/p/${bech32}`}
    class="mention-inline {className}"
    onclick={handleClick}
  >
    <Avatar {ndk} pubkey={user?.pubkey} size={16} class="mention-avatar" />
    <span class="mention-name">{displayName}</span>
  </a>
{/if}

<style>
  .mention-inline {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    vertical-align: middle;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    background: var(--mention-background);
  }

  .mention-inline:hover {
    opacity: 0.8;
    text-decoration: underline;
    background: var(--mention-background-hover);
  }

  .mention-inline :global(.mention-avatar) {
    flex-shrink: 0;
  }

  .mention-name {
    font-weight: 600;
    color: currentColor;
  }
</style>