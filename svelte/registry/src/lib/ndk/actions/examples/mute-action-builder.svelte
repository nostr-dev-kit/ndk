<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createMuteAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
  }

  let { ndk, user }: Props = $props();

  const muteState = createMuteAction(() => ({ ndk, target: user }));
</script>

<div class="demo-card">
  <p>User: {user.npub.slice(0, 16)}...</p>
  <button class="custom-btn" class:muted={muteState.isMuted} onclick={muteState.mute}>
    {muteState.isMuted ? '🔇 Muted' : '🔊 Mute'}
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

  .custom-btn {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: hsl(var(--color-foreground));
  }

  .custom-btn:hover {
    background: hsl(var(--color-muted));
  }

  .custom-btn.muted {
    color: #ef4444;
    border-color: #ef4444;
  }
</style>
