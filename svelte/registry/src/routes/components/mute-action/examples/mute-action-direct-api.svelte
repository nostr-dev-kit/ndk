<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
  }

  let { ndk, user }: Props = $props();

  const isMutedDirect = $derived(ndk.$mutes?.has(user.pubkey) ?? false);

  async function handleDirectToggle() {
    try {
      await ndk.$mutes?.toggle(user.pubkey);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }
</script>

<div class="bg-card border border-border rounded-xl p-6 flex justify-between items-center">
  <p class="m-0 text-foreground">User: {user.npub.slice(0, 16)}...</p>
  <button
    class="px-4 py-2 bg-card border border-border rounded-lg cursor-pointer transition-all text-foreground hover:bg-muted"
    class:text-red-500={isMutedDirect}
    class:border-red-500={isMutedDirect}
    onclick={handleDirectToggle}
  >
    {isMutedDirect ? 'Unmute' : 'Mute'}
  </button>
</div>
