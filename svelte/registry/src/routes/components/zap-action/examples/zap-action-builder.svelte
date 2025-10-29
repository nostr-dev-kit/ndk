<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createZapAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const zapState = createZapAction(() => ({ target: event }), ndk);
</script>

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed text-foreground">{event.content}</p>
  </div>
  <div class="flex gap-2 pt-4 border-t border-border">
    <button
      class={`px-4 py-2 rounded-lg border transition-colors hover:bg-accent ${
        zapState.hasZapped
          ? 'border-primary bg-primary/10'
          : 'bg-muted'
      }`}
    >
      ⚡ {zapState.totalAmount} sats
    </button>
  </div>
</div>


