<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey }: { ndk: NDKSvelte; pubkey: string } = $props();
</script>

<div class="flex flex-col gap-4">
  <div>
    <div class="text-sm text-muted-foreground mb-1">With Verification Badge</div>
    <User.Root {ndk} {pubkey}>
      <User.Nip05 showVerified={true} />
    </User.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-1">Without Verification</div>
    <User.Root {ndk} {pubkey}>
      <User.Nip05 showVerified={false} />
    </User.Root>
  </div>
</div>
