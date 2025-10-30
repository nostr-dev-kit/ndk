<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/ndk/user-profile';
  import { UserCardClassic } from '$lib/ndk/blocks';
  import { Popover } from 'bits-ui';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<div class="flex flex-wrap gap-4">
  {#each pubkeys as pubkey}
    <Popover.Root openDelay={500} closeDelay={100}>
      <Popover.Trigger>
        <UserProfile.Root {ndk} {pubkey}>
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <UserProfile.Avatar size={32} />
            <UserProfile.Name class="text-sm font-medium" />
          </div>
        </UserProfile.Root>
      </Popover.Trigger>
      <Popover.Content>
        <UserCardClassic {ndk} {pubkey} />
      </Popover.Content>
    </Popover.Root>
  {/each}
</div>
