<Relay.Root {ndk} {relayUrl}>
	<button type="button" class="group flex items-center gap-4 w-full p-4 rounded-lg bg-card hover:bg-muted border-b border-border last:border-b-0 transition-all duration-200 hover:shadow-sm text-left">
		<div class="flex-shrink-0">
			<Relay.Icon />
		</div>

		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<Relay.Name class="text-base font-semibold truncate" />
			</div>

			<Relay.Url class="text-xs text-muted-foreground mb-1" showProtocol={false} />
			<Relay.Description maxLines={2} class="text-xs text-muted-foreground leading-relaxed" />
		</div>

		<div class="flex-shrink-0">
			<Relay.BookmarkButton {bookmarks} size="md" />
		</div>
	</button>
</Relay.Root>
