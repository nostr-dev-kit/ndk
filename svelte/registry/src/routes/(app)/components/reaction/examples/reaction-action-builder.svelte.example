<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '$lib/registry/builders/reaction-action.svelte.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const reaction = createReactionAction(() => ({ event }), ndk);
</script>

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed text-foreground">{event.content}</p>
  </div>
  <div class="flex gap-2 pt-4 border-t border-border">
    <button class="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-transparent hover:bg-accent transition-colors" onclick={() => reaction.react("+")}>
      <span class="text-lg">❤️</span>
      <span class="text-sm font-medium">{reaction.get("+")?.count ?? 0}</span>
    </button>

    <button
      class={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-accent ${
        reaction.get("🔥")?.hasReacted
          ? 'border-primary bg-primary/10'
          : 'bg-muted'
      }`}
      onclick={() => reaction.react("🔥")}
    >
      <span class="text-lg">🔥</span>
      <span class="text-sm font-medium">{reaction.get("🔥")?.count ?? 0}</span>
    </button>

    <button
      class={`px-3 py-2 text-2xl rounded-lg border transition-colors hover:bg-accent ${
        reaction.get("🚀")?.hasReacted
          ? 'border-primary bg-primary/10'
          : 'bg-muted'
      }`}
      onclick={() => reaction.react("🚀")}
      title={reaction.get("🚀")?.hasReacted ? 'Remove reaction' : 'React with 🚀'}
    >
      🚀
    </button>
  </div>
</div>


