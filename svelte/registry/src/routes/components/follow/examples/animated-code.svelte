<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import FollowButtonAnimated from '$lib/registry/blocks/follow-button-animated.svelte';

  interface Props {
    ndk: NDKSvelte;
    target: NDKUser | string;
  }

  let { ndk, target }: Props = $props();
</script>

<FollowButtonAnimated {ndk} {target} />
