<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  let { ndk, pubkey, size }: { ndk: NDKSvelte; pubkey: string; size: number } = $props();

  const sizeClass = $derived(`w-[${size}px] h-[${size}px]`);
</script>

<div class="flex items-center gap-4">
  <User.Root {ndk} {pubkey}>
    <User.Avatar class={sizeClass} />
  </User.Root>
  <span class="text-sm text-muted-foreground">{size}px</span>
</div>
