<script lang="ts">
  import { AvatarGroup } from '$lib/ndk/avatar-group/index.js';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<AvatarGroup {ndk} {pubkeys} />
