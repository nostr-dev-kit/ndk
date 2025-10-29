<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  // Example pubkeys for demonstration
  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'  // jb55
  ];
</script>

<div class="flex flex-col gap-4 max-w-[600px]">
  {#each examplePubkeys as pubkey}
    <UserProfile.Root {ndk} {pubkey}>
      <div class="flex gap-4 p-6 bg-card border border-border rounded-xl">
        <UserProfile.Avatar size={64} />
        <div class="flex-1 flex flex-col gap-3">
          <div class="flex justify-between items-start gap-4">
            <div class="flex flex-col gap-1 items-start">
              <UserProfile.Name field="displayName" size="lg" />
              <UserProfile.Field field="name" size="sm" class="text-muted-foreground" />
            </div>
            <UserProfile.Follow variant="primary" />
          </div>
          <UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
        </div>
      </div>
    </UserProfile.Root>
  {/each}
</div>
