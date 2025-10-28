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

<div class="demo-card">
  <p>User: {user.npub.slice(0, 16)}...</p>
  <button class="direct-btn" class:muted={isMutedDirect} onclick={handleDirectToggle}>
    {isMutedDirect ? 'Unmute' : 'Mute'}
  </button>
</div>

<style>
  .demo-card {
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .demo-card p {
    margin: 0;
    color: hsl(var(--color-foreground));
  }

  .direct-btn {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: hsl(var(--color-foreground));
  }

  .direct-btn:hover {
    background: hsl(var(--color-muted));
  }

  .direct-btn.muted {
    color: #ef4444;
    border-color: #ef4444;
  }
</style>
