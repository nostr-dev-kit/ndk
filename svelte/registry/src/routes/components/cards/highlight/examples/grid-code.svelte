<HighlightCard.Root {ndk} {event}>
  <article class="hover:bg-card/30 transition-colors w-full">
    <!-- Square card with highlight -->
    <div
      class="relative aspect-square rounded-lg overflow-hidden bg-card border border-border shadow-lg w-full"
    >
      <!-- Content -->
      <div
        class="relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[150px]"
      >
        <HighlightCard.Content />
      </div>

      <!-- Highlighter icon (bottom left corner) -->
      <div class="absolute bottom-2 left-2">
        <!-- Icon SVG here -->
      </div>

      <!-- Source badge -->
      <HighlightCard.Source position="bottom-right" size="sm" />
    </div>

    <!-- Author info below -->
    <div class="flex items-center gap-2 mt-2 px-1">
      <UserProfile.Avatar {ndk} user={event.author} size={20} class="rounded-full" />
      <UserProfile.Name {ndk} user={event.author} class="text-xs text-muted-foreground truncate" />
    </div>
  </article>
</HighlightCard.Root>

