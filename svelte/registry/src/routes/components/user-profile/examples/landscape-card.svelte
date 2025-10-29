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

<div style="display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
  {#each examplePubkeys as pubkey}
    <UserProfile.Root {ndk} {pubkey}>
      <div class="user-card-landscape">
        <UserProfile.Avatar size={64} />
        <div class="user-card-content">
          <div class="user-card-header">
            <div class="user-card-details">
              <UserProfile.Name field="displayName" size="lg" />
              <UserProfile.Field field="name" size="sm" class="user-handle" />
            </div>
            <UserProfile.Follow variant="primary" />
          </div>
          <UserProfile.Field field="about" maxLines={2} class="user-bio" />
        </div>
      </div>
    </UserProfile.Root>
  {/each}
</div>

<style>
  .user-card-landscape {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
  }

  .user-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .user-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .user-card-header .user-card-details {
    align-items: flex-start;
  }

  .user-card-details {
    display: flex;
    flex-direction: column;
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
</style>
