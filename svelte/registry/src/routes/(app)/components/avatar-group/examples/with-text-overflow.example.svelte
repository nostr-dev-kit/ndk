<script lang="ts">
  import { AvatarGroup } from '$lib/registry/components/article/cards/basic/index.ts';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<AvatarGroup {ndk} {pubkeys} max={3} overflowVariant="text" />
