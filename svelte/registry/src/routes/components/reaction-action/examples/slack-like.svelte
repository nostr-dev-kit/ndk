<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { Tooltip } from 'bits-ui';
  import AvatarGroup from '$lib/ndk/avatar-group/avatar-group.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create a reaction action to get access to all reactions
  const reactionState = createReactionAction(() => ({ event }), ndk);

  // Function to react with a specific emoji
  async function reactWith(emoji: string) {
    await reactionState.react(emoji);
  }
</script>

<div class="bg-card border border-border rounded-xl p-6">
  {#if reactionState.all.length > 0}
    <Tooltip.Provider delayDuration={100}>
      <div class="flex flex-wrap gap-2 pt-4">
        {#each reactionState.all as reaction (reaction.emoji)}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <button
                class={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  border transition-all hover:scale-105
                  ${reaction.hasReacted
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:bg-accent'
                  }
                `}
                onclick={() => reactWith(reaction.emoji)}
              >
                <span class="text-base">{reaction.emoji}</span>
                <span class="text-sm font-medium">{reaction.count}</span>
              </button>
            </Tooltip.Trigger>

            <Tooltip.Content
              class="z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
            >
              <div class="flex flex-col gap-2">
                <AvatarGroup
                  {ndk}
                  pubkeys={reaction.pubkeys}
                  max={5}
                  size={24}
                  spacing="tight"
                />
              </div>
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </div>
    </Tooltip.Provider>
  {:else}
    <div class="pt-4 border-t border-border text-sm text-muted-foreground">
      No reactions yet. Be the first to react!
    </div>
  {/if}
</div>
