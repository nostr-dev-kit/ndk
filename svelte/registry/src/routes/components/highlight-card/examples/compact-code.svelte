<HighlightCard.Root {ndk} {event}>
  <div class="block p-4 hover:bg-card/30 transition-colors rounded-lg">
    <div class="relative">
      <!-- Highlight marker line on the left -->
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 to-primary rounded-full"></div>

      <div class="pl-4">
        <!-- Highlighted text -->
        <div class="mb-3">
          <HighlightCard.Content fontSize="text-base" class="text-foreground leading-relaxed font-serif italic" />
        </div>

        <!-- Source -->
        <HighlightCard.Source class="text-xs" />
      </div>
    </div>
  </div>
</HighlightCard.Root>
