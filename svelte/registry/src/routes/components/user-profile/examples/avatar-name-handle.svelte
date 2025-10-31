<script lang="ts">
  import { UserProfile } from '$lib/components/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={40} />
    <div class="flex flex-col">
      <UserProfile.Name class="font-semibold" />
      <UserProfile.Handle class="text-sm text-muted-foreground" />
    </div>
  </div>
</UserProfile.Root>
