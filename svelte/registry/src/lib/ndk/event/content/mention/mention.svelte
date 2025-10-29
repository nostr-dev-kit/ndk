<!-- @ndk-version: mention-preview@0.0.0 -->
<script lang="ts">
    import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';

  interface MentionProps {
    ndk: NDKSvelte;
    bech32: string;
    class?: string;
  }

  let { ndk, bech32, class: className = '' }: MentionProps = $props();

  const profileFetcher = createProfileFetcher(() => ({ user: bech32 }), ndk);
  const profile = $derived(profileFetcher.profile);
</script>

<span class="mention {className}" role="button" tabindex="0">
  {#if profileFetcher?.loading}
    @{bech32.slice(0, 8)}...
  {:else if profile}
    @{profile?.name || profile?.displayName || bech32}
  {/if}
</span>

<style>
  .mention {
    color: var(--primary);
    text-decoration: underline;
    cursor: pointer;
  }

  .mention:hover {
    opacity: 0.8;
  }
</style>
