<Relay.Root {ndk} {relayUrl}>
	<button type="button" class="group flex flex-col items-center justify-center gap-2 w-[160px] h-[160px] rounded-xl overflow-hidden bg-card hover:bg-muted border border-border transition-colors text-center relative p-4">
		<div class="absolute top-2 right-2 z-10">
			<Relay.BookmarkButton {bookmarks} size="sm" />
		</div>

		<Relay.Icon size={48} />
		<Relay.Name class="text-sm font-medium line-clamp-2" />
	</button>
</Relay.Root>
