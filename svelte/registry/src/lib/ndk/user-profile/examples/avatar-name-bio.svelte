<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={48} />
    <div class="flex-1 min-w-0 flex flex-col">
      <UserProfile.Name class="font-semibold" />
      <UserProfile.Bio maxLines={2} class="text-sm" />
    </div>
  </div>
</UserProfile.Root>
