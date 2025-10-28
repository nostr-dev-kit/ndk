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
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // jb55
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d'  // fiatjaf
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
  {#each examplePubkeys as pubkey}
    <UserProfile.Root {ndk} {pubkey}>
      <div class="user-card-compact">
        <UserProfile.Avatar size={48} />
        <div class="user-card-info">
          <UserProfile.Name field="displayName" size="md" truncate={true} />
          <UserProfile.Field field="name" size="sm" />
        </div>
        <UserProfile.Follow variant="default" />
      </div>
    </UserProfile.Root>
  {/each}
</div>

<style>
  .user-card-compact {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }

  .user-card-compact:hover {
    background: hsl(var(--color-muted));
  }

  .user-card-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
</style>
