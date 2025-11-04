<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import ZapButton from '$lib/registry/components/zap-button/zap-button.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed">{event.content}</p>
  </div>
  <div class="flex gap-2 pt-4 border-t border-border">
    <ZapButton {ndk} {event} />
  </div>
</div>
