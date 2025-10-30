<HighlightCard.Root {ndk} {event}>
  <article>
    <!-- Square elegant card with gradient -->
    <div
      class="relative aspect-square rounded-lg overflow-hidden border border-border shadow-lg"
      style="background: linear-gradient(135deg, hsl(var(--color-card)) 0%, hsl(var(--color-card) / 0.7) 100%)"
    >
      <!-- Content with elegant styling -->
      <div class="relative flex flex-col items-center justify-center p-6 h-full">
        <HighlightCard.Content class="text-center leading-relaxed font-serif text-sm" />
      </div>

      <HighlightCard.Source position="bottom-right" size="sm" />
    </div>
  </article>
</HighlightCard.Root>
