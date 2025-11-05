<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import RepostButton from '$lib/registry/components/repost-button/repost-button.svelte';
  import RepostButtonPill from '$lib/registry/components/repost-button-pill.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="space-y-4">
  <div>
    <p class="text-sm text-muted-foreground mb-2">Default</p>
    <RepostButton {ndk} {event} />
  </div>

  <div>
    <p class="text-sm text-muted-foreground mb-2">Pill (Outline)</p>
    <RepostButtonPill {ndk} {event} variant="outline" />
  </div>
</div>
