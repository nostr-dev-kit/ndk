<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createFollowAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
    onToggle: () => void;
  }

  let { ndk, user, onToggle }: Props = $props();

  const follow = createFollowAction(() => ({ ndk, target: user }));
</script>

<div class="integration-example">
  <div class="status-badge">
    {follow.isFollowing ? 'Following' : 'Not Following'}
  </div>
  <button
    class="integration-btn"
    onclick={onToggle}
  >
    {follow.isFollowing ? 'Unfollow' : 'Follow'}
  </button>
</div>

<style>
  .integration-example {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    background: hsl(var(--color-primary) / 0.1);
    color: hsl(var(--color-primary));
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .integration-btn {
    padding: 0.5rem 1.5rem;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .integration-btn:hover {
    opacity: 0.9;
  }
</style>
