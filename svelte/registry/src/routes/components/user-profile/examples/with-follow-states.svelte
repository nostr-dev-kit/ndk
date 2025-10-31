<script lang="ts">
  import { UserProfile } from '$lib/registry/components/user-profile';
  import { FollowButton, FollowButtonPill } from '$lib/registry/components/blocks';
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

  const user1 = $derived(ndk.getUser({ pubkey: examplePubkeys[0] }));
  const user2 = $derived(ndk.getUser({ pubkey: examplePubkeys[1] }));
</script>

<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
  <UserProfile.Root {ndk} pubkey={examplePubkeys[0]}>
    <div class="flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl">
      <UserProfile.Avatar size={96} />
      <div class="flex flex-col items-center gap-1">
        <UserProfile.Name field="displayName" size="lg" />
        <span class="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">Following</span>
      </div>
      <UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
      <FollowButton {ndk} target={user1} showIcon={false} />
    </div>
  </UserProfile.Root>

  <UserProfile.Root {ndk} pubkey={examplePubkeys[1]}>
    <div class="flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl">
      <UserProfile.Avatar size={96} />
      <div class="flex flex-col items-center gap-1">
        <UserProfile.Name field="displayName" size="lg" />
      </div>
      <UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
      <FollowButtonPill {ndk} target={user2} variant="solid" />
    </div>
  </UserProfile.Root>
</div>
