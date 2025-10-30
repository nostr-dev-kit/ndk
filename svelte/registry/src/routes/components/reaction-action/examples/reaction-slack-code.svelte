<!-- Horizontal with popover avatars -->
<div class="space-y-6">
  <div>
    <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Horizontal</h4>
    <Tooltip.Provider delayDuration={100}>
      <div class="flex flex-wrap gap-2">
        {#each reactionState.all as reaction (reaction.emoji)}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <button
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-105 {reaction.hasReacted ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background hover:bg-accent'}"
                onclick={() => reactionState.react(reaction.emoji)}
              >
                <span class="text-base">{reaction.emoji}</span>
                <span class="text-sm font-medium">{reaction.count}</span>
              </button>
            </Tooltip.Trigger>

            <Tooltip.Content class="z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
              <AvatarGroup {ndk} pubkeys={reaction.pubkeys} max={5} size={24} spacing="tight" />
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </div>
    </Tooltip.Provider>
  </div>

  <!-- Vertical with inline avatars -->
  <div>
    <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vertical</h4>
    <div class="flex flex-col gap-1.5">
      {#each reactionState.all as reaction (reaction.emoji)}
        <button
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer {reaction.hasReacted ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}"
          onclick={() => reactionState.react(reaction.emoji)}
        >
          <span class="text-base">{reaction.emoji}</span>
          <span class="text-sm font-medium">{reaction.count}</span>
          <AvatarGroup {ndk} pubkeys={reaction.pubkeys} max={15} size={20} spacing="tight" />
        </button>
      {/each}
    </div>
  </div>
</div>
