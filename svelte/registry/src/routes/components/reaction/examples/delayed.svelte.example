<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const reactionState = createReactionAction(() => ({ event, delayed: 5 }), ndk);

  const heartStats = $derived(reactionState.get('❤️') ?? { count: 0, hasReacted: false });
  const fireStats = $derived(reactionState.get('🔥') ?? { count: 0, hasReacted: false });
</script>

<div class="bg-card border border-border rounded-xl p-6 shadow-sm">
  <div class="mb-4">
    <p class="m-0 text-foreground leading-relaxed">{event.content}</p>
  </div>

  <div class="flex flex-col gap-4 pt-4 border-t border-border">
    <div class="flex gap-2">
      <button
        onclick={() => reactionState.react('❤️')}
        class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors {heartStats.hasReacted ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-background border-border hover:bg-muted'}"
      >
        ❤️ {heartStats.count}
      </button>

      <button
        onclick={() => reactionState.react('🔥')}
        class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors {fireStats.hasReacted ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-background border-border hover:bg-muted'}"
      >
        🔥 {fireStats.count}
      </button>
    </div>

    <div class="text-xs text-muted-foreground">
      💡 Reactions are delayed by 5 seconds. Click again to cancel before publishing.
    </div>
  </div>
</div>
