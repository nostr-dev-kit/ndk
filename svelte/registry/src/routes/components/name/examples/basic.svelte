<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey }: { ndk: NDKSvelte; pubkey: string } = $props();
</script>

<div class="flex flex-col gap-4">
  <div>
    <div class="text-sm text-muted-foreground mb-1">Display Name</div>
    <User.Root {ndk} {pubkey}>
      <User.Name field="displayName" />
    </User.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-1">Username</div>
    <User.Root {ndk} {pubkey}>
      <User.Name field="name" />
    </User.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-1">Both</div>
    <User.Root {ndk} {pubkey}>
      <User.Name field="both" />
    </User.Root>
  </div>
</div>
