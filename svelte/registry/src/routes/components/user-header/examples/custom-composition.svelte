<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/ndk/user-profile/index.js';
  import FollowAction from '$lib/ndk/actions/follow-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();

  const user = $derived(ndk.getUser({ pubkey }));
</script>

<UserProfile.Root {ndk} {user}>
  <!-- Custom banner -->
  <UserProfile.Banner class="custom-banner" />

  <!-- Custom content layout -->
  <div class="custom-content">
    <div class="avatar-section">
      <UserProfile.Avatar size={100} />
    </div>

    <div class="info-section">
      <div class="name-row">
        <UserProfile.Name />
        <FollowAction {ndk} target={user} variant="primary" />
      </div>

      <UserProfile.Bio />
    </div>
  </div>
</UserProfile.Root>

<style>
  .custom-content {
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
    margin-top: -3rem;
  }

  .avatar-section {
    flex-shrink: 0;
  }

  .info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 3rem;
  }

  .name-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
