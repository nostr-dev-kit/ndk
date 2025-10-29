<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import MuteAction from '$lib/ndk/actions/mute-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
  }

  let { ndk, user }: Props = $props();
</script>

<div class="demo-card">
  <p>User: {user.npub.slice(0, 16)}...</p>
  <MuteAction {ndk} target={user} />
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
</style>
