const reactionState = createReactionAction(() => ({ event }), ndk);

<div class="flex gap-2">
  {#each reactionState.all as reaction}
    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class:reacted={reaction.hasReacted}
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
