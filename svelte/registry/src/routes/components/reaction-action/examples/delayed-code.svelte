<!-- Using createReactionAction with delayed option -->

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
