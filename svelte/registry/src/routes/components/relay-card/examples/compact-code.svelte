<RelayCard.Root {ndk} {relayUrl}>
	<button type="button" class="group flex flex-col items-center justify-center gap-2 w-[160px] h-[160px] rounded-xl overflow-hidden bg-card hover:bg-muted border border-border transition-colors text-center relative p-4">
		<div class="absolute top-2 right-2 z-10">
			<RelayCard.BookmarkButton {bookmarks} size="sm" />
		</div>

		<RelayCard.Icon size={48} />
		<RelayCard.Name class="text-sm font-medium line-clamp-2" />
	</button>
</RelayCard.Root>
