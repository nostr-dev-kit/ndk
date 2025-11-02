<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
  import { FollowPack } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example follow pack (you would normally get this from an event)
  let followPack = $state<NDKFollowPack | null>(null);
</script>

<div class="follow-pack-demo">
  {#if followPack}
    <FollowPack.Root {ndk} {followPack}>
      <div class="pack-card">
        <FollowPack.Title class="title" />
        <FollowPack.Description class="description" />
        <FollowPack.MemberCount class="count" format="long" />
      </div>
    </FollowPack.Root>
  {:else}
    <div class="placeholder">
      <p>Load a follow pack event to see details</p>
    </div>
  {/if}
</div>

<style>
  .follow-pack-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
  }

  .pack-card {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }

  .pack-card :global(.title) {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .pack-card :global(.description) {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .pack-card :global(.count) {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.5rem;
  }

  .placeholder {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
  }
</style>
