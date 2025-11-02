<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui/user';
  import UserCardClassic from '$lib/registry/components/user-card/user-card-classic.svelte';
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
        <User.Root {ndk} {pubkey}>
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <User.Avatar size={32} />
            <User.Name class="text-sm font-medium" />
          </div>
        </User.Root>
      {/snippet}
      {#snippet content()}
        <UserCardClassic {ndk} {pubkey} />
      {/snippet}
    </HoverCard>
  {/each}
</div>
