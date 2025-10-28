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
  <div class="flex flex-col gap-4 max-w-md">
    <div class="flex items-center gap-3">
      <UserProfile.Avatar size={64} />
      <div class="flex-1 min-w-0">
        <UserProfile.Name class="font-bold text-lg" />
        <UserProfile.Handle class="text-sm text-muted-foreground" />
      </div>
    </div>
    <UserProfile.Bio maxLines={3} />
  </div>
</UserProfile.Root>
