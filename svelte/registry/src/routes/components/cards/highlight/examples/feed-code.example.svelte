<HighlightCard.Root {ndk} {event}>
  <article class="p-4 hover:bg-card/30 transition-colors border-b border-border">
    <!-- Author header -->
    <div class="mb-3">
      <EventCard.Root {ndk} {event}>
        <EventCard.Header variant="full" avatarSize="md" showTimestamp={true} />
      </EventCard.Root>
    </div>

    <!-- Book page style highlight -->
    <div class="relative rounded-lg overflow-hidden bg-card border border-border shadow-lg mb-2">
      <div class="relative flex flex-col items-center justify-center py-12 px-8 min-h-[200px]">
        <HighlightCard.Content />
      </div>

      <HighlightCard.Source position="bottom-right" />
    </div>

    <!-- Actions -->
    <EventCard.Root {ndk} {event}>
      <EventCard.Actions />
    </EventCard.Root>
  </article>
</HighlightCard.Root>
