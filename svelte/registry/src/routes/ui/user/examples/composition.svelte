<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  const userPubkey = ndk.$currentUser?.pubkey || 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
</script>

<div class="user-card">
  <User.Root {ndk} user={userPubkey}>
    <div class="user-header">
      <User.Banner class="banner" />
      <User.Avatar size={80} class="avatar" />
    </div>
    <div class="user-content">
      <User.Name class="user-name" />
      <User.Handle class="user-handle" />
      <User.Nip05 class="user-nip05" />
      <User.Bio class="user-bio" />
    </div>
  </User.Root>
</div>

<style>
  .user-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    max-width: 400px;
  }

  .user-header {
    position: relative;
    height: 120px;
  }

  .user-card :global(.banner) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-card :global(.avatar) {
    position: absolute;
    bottom: -40px;
    left: 1.5rem;
    border: 4px solid white;
    border-radius: 50%;
  }

  .user-content {
    padding: 3rem 1.5rem 1.5rem;
  }

  .user-card :global(.user-name) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: #111827;
  }

  .user-card :global(.user-handle) {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .user-card :global(.user-nip05) {
    font-size: 0.875rem;
    color: #10b981;
    margin-bottom: 0.75rem;
  }

  .user-card :global(.user-bio) {
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #4b5563;
  }
</style>
