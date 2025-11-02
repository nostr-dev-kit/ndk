<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/registry/components/user-profile';
  import UserCardClassic from '$lib/registry/components/blocks/user-card-classic.svelte';
  import { Popover } from 'bits-ui';
  import HoverCard from './hover-card.svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<div class="flex flex-wrap gap-4">
  {#each pubkeys as pubkey (pubkey)}
    <HoverCard>
      {#snippet trigger()}
        <UserProfile.Root {ndk} {pubkey}>
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <UserProfile.Avatar size={32} />
            <UserProfile.Name class="text-sm font-medium" />
          </div>
        </UserProfile.Root>
      {/snippet}
      {#snippet content()}
        <UserCardClassic {ndk} {pubkey} />
      {/snippet}
    </HoverCard>
  {/each}
</div>
