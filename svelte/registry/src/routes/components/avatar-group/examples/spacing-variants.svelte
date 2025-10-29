<script lang="ts">
  import { AvatarGroup } from '$lib/ndk/avatar-group/index.js';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<div class="flex flex-col gap-3">
  <div class="flex items-center gap-3">
    <span class="text-xs text-muted-foreground w-16">Tight:</span>
    <AvatarGroup {ndk} {pubkeys} spacing="tight" max={3} />
  </div>
  <div class="flex items-center gap-3">
    <span class="text-xs text-muted-foreground w-16">Normal:</span>
    <AvatarGroup {ndk} {pubkeys} spacing="normal" max={3} />
  </div>
  <div class="flex items-center gap-3">
    <span class="text-xs text-muted-foreground w-16">Loose:</span>
    <AvatarGroup {ndk} {pubkeys} spacing="loose" max={3} />
  </div>
</div>
