<script lang="ts">
  import { UserProfile } from '$lib/registry/components/user-profile';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    examplePubkeys: string[];
    manyPubkeys: string[];
  }

  let { ndk, examplePubkeys, manyPubkeys }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div>
    <h4 class="text-sm font-medium mb-2">Basic (5 users)</h4>
    <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} />
  </div>

  <div>
    <h4 class="text-sm font-medium mb-2">With Overflow (7 users, max 3)</h4>
    <UserProfile.AvatarGroup {ndk} pubkeys={manyPubkeys} max={3} />
  </div>

  <div>
    <h4 class="text-sm font-medium mb-2">Different Sizes</h4>
    <div class="flex items-center gap-4">
      <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} size={32} max={3} />
      <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} size={48} max={3} />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-medium mb-2">Spacing Variants</h4>
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-16">Tight:</span>
        <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} spacing="tight" max={3} />
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-16">Normal:</span>
        <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} spacing="normal" max={3} />
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-16">Loose:</span>
        <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} spacing="loose" max={3} />
      </div>
    </div>
  </div>
</div>
