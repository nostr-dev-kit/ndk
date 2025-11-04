<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Highlight } from '$lib/registry/ui/highlight/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<Highlight.Root {ndk} {event} variant="feed">
  <div class="p-4 border border-border rounded-lg">
    <div class="bg-card p-6 rounded-lg relative">
      <Highlight.Content class="text-lg" />
      <Highlight.Source />
    </div>
  </div>
</Highlight.Root>
