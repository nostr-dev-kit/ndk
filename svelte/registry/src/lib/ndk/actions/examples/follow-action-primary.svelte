<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import FollowAction from '$lib/ndk/actions/follow-action.svelte';
  import { UserProfile } from '$lib/ndk/user-profile';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
    pubkey: string | undefined;
    onfollowsuccess: (e: Event) => void;
    onfollowonerror: (e: Event) => void;
  }

  let { ndk, user, pubkey, onfollowsuccess, onfollowonerror }: Props = $props();
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class="user-display">
    <UserProfile.Avatar size={48} />
    <div class="user-info">
      <UserProfile.Name />
      <FollowAction
        {ndk}
        target={user}
        variant="primary"
        {onfollowsuccess}
        {onfollowonerror}
      />
    </div>
  </div>
</UserProfile.Root>

<style>
  .user-display {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
