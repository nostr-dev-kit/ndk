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
  <UserProfile.Banner />

  <!-- Custom content layout -->
  <div class="p-6 flex gap-6 -mt-12">
    <div class="shrink-0">
      <UserProfile.Avatar size={100} />
    </div>

    <div class="flex-1 flex flex-col gap-4 mt-12">
      <div class="flex justify-between items-center">
        <UserProfile.Name />
        <FollowAction {ndk} target={user} variant="primary" />
      </div>

      <UserProfile.Bio />
    </div>
  </div>
</UserProfile.Root>
