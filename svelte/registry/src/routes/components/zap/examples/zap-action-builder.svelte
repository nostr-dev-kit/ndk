<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import * as ZapSend from '$lib/registry/components/zap-send/index.js';
  import * as Zaps from '$lib/registry/components/zaps/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed text-foreground">{event.content}</p>
  </div>
  <div class="flex gap-2 pt-4 border-t border-border">
    <Zaps.Root {ndk} {event}>
      {#snippet children(zaps, stats)}
        <ZapSend.Root {ndk} recipient={event}>
          {#snippet children({ send })}
            <button
              use:send={{ amount: 1000 }}
              class={`px-4 py-2 rounded-lg border transition-colors hover:bg-accent ${
                stats.count > 0
                  ? 'border-primary bg-primary/10'
                  : 'bg-muted'
              }`}
            >
              ⚡ {stats.total} sats
            </button>
          {/snippet}
        </ZapSend.Root>
      {/snippet}
    </Zaps.Root>
  </div>
</div>


