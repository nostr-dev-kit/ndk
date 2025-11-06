<script lang="ts">
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { Tooltip } from 'bits-ui';
  import AvatarGroup from '$lib/registry/components/avatar-group/avatar-group.svelte';

  const reactionState = createReactionAction(() => ({ event }), ndk);
</script>

<div class="flex gap-2">
  {#each reactionState.all as reaction (reaction.emoji)}
    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class="px-3 py-1.5 rounded-full border transition-colors {reaction.hasReacted ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}"
          onclick={() => reactionState.react(reaction.emoji)}
        >
          {reaction.emoji} {reaction.count}
        </button>
      </Tooltip.Trigger>

      <Tooltip.Content>
        <AvatarGroup {ndk} pubkeys={reaction.pubkeys} max={5} size={24} />
      </Tooltip.Content>
    </Tooltip.Root>
  {/each}
</div>
