<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import AvatarGroup from '$lib/ndk/user-profile/avatar-group.svelte';

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
  <div class="flex flex-wrap gap-2 pt-4 border-t border-border">
    {#each reaction.all as { emoji, count, hasReacted, pubkeys } (emoji)}
      <button
        class={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors hover:bg-accent group ${
          hasReacted
            ? 'border-primary bg-primary/10'
            : 'bg-muted'
        }`}
        onclick={() => reaction.react(emoji)}
      >
        <span class="text-base">{emoji}</span>
        <span class="text-sm font-medium">{count}</span>

        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-popover border border-border rounded-lg p-2 shadow-lg w-32">
          <AvatarGroup {ndk} pubkeys={pubkeys.slice(0, 3)} max={3} size={24} spacing="tight" />
        </div>
      </button>
    {/each}
    {#if reaction.all.length === 0}
      <p class="text-sm text-muted-foreground">No reactions yet</p>
    {/if}
  </div>
</div>


