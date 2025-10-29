<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { ThreadViewTwitter } from '$lib/ndk/blocks';

  let { ndk, nevent }: { ndk: NDKSvelte; nevent: string } = $props();

  const thread = createThreadView(() => ({
    focusedEvent: nevent
  }), ndk);
</script>

<ThreadViewTwitter {ndk} {thread} />
