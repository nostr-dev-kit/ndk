<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey, size, truncate }: { ndk: NDKSvelte; pubkey: string; size: 'sm' | 'md' | 'lg' | 'xl'; truncate: boolean } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <div class="text-sm text-muted-foreground mb-2">Current size: {size}</div>
    <User.Root {ndk} {pubkey}>
      <User.Name field="displayName" {size} />
    </User.Root>
  </div>

  <div>
    <div class="text-sm text-muted-foreground mb-2">With truncation ({truncate ? 'enabled' : 'disabled'})</div>
    <div style="max-width: 200px;" class="border border-border rounded p-2">
      <User.Root {ndk} {pubkey}>
        <User.Name field="displayName" {truncate} />
      </User.Root>
    </div>
  </div>
</div>
