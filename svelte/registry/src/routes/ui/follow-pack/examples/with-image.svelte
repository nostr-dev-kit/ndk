<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
  import { FollowPack } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let followPack = $state<NDKFollowPack | null>(null);
</script>

<div class="with-image-demo">
  {#if followPack}
    <FollowPack.Root {ndk} {followPack}>
      <div class="pack-card">
        <FollowPack.Image class="pack-image" />
        <div class="pack-content">
          <FollowPack.Title class="title" />
          <FollowPack.Description class="description" />
          <div class="pack-footer">
            <FollowPack.MemberCount format="short" class="count" />
          </div>
        </div>
      </div>
    </FollowPack.Root>
  {:else}
    <div class="placeholder">
      <p>Load a follow pack with image to see the card</p>
    </div>
  {/if}
</div>

<style>
  .with-image-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .pack-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    overflow: hidden;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .pack-card :global(.pack-image) {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }

  .pack-content {
    padding: 1rem;
  }

  .pack-content :global(.title) {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .pack-content :global(.description) {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .pack-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .pack-footer :global(.count) {
    font-size: 0.8125rem;
    color: #6b7280;
    font-weight: 500;
  }

  .placeholder {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
  }
</style>
