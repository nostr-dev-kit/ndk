<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  // Example pubkeys for demonstration
  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'  // jb55
  ];
</script>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
  {#each examplePubkeys as pubkey}
    <UserProfile.Root {ndk} {pubkey}>
      <div class="user-card-portrait">
        <UserProfile.Avatar size={96} />
        <div class="user-card-details">
          <UserProfile.Name field="displayName" size="lg" />
          <UserProfile.Field field="name" size="sm" class="user-handle" />
        </div>
        <UserProfile.Field field="about" maxLines={2} class="user-bio" />
        <div class="user-stats">
          <div class="stat">
            <span class="stat-value">234</span>
            <span class="stat-label">notes</span>
          </div>
          <div class="stat-divider">•</div>
          <div class="stat">
            <span class="stat-value">1.5K</span>
            <span class="stat-label">followers</span>
          </div>
        </div>
        <UserProfile.Follow variant="primary" />
      </div>
    </UserProfile.Root>
  {/each}
</div>

<style>
  .user-card-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
  }

  .user-card-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .user-handle {
    color: hsl(var(--color-muted-foreground));
  }

  :global(.user-bio) {
    color: hsl(var(--color-muted-foreground));
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .user-stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .stat-label {
    color: hsl(var(--color-muted-foreground));
    font-size: 0.75rem;
  }

  .stat-divider {
    color: hsl(var(--color-muted-foreground));
  }
</style>
