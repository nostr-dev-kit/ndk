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

  const profileFetcher = $derived.by(() => createProfileFetcher({ ndk, user: () => bech32 }));
</script>

<span class="mention {className}" role="button" tabindex="0">
  {#if profileFetcher?.loading}
    @{bech32.slice(0, 8)}...
  {:else if profileFetcher?.profile}
    @{profileFetcher.profile?.name || profileFetcher.profile?.displayName || bech32}
  {/if}
</span>

<style>
  .mention {
    color: #2563eb;
    text-decoration: underline;
    cursor: pointer;
  }

  .mention:hover {
    color: #1d4ed8;
  }
</style>
