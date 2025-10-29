<RelayCard.Root {ndk} {relayUrl}>
	<button type="button" class="group flex flex-col w-[280px] h-[320px] rounded-2xl overflow-hidden bg-card hover:bg-muted border border-border transition-colors text-left relative">
		<!-- Background Icon with Gradient - covers entire card -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 scale-[2.5]">
				<RelayCard.Icon size={200} />
			</div>
			<div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15"></div>
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-card/60"></div>
			<div class="absolute inset-0 backdrop-blur-sm"></div>
		</div>

		<div class="absolute top-3 right-3 z-10">
			<RelayCard.BookmarkButton {bookmarks} size="sm" />
		</div>

		<div class="relative flex items-center justify-center pt-8 pb-4 z-[1]">
			<div class="relative">
				<div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
				<RelayCard.Icon size={80} class="relative z-[1]" />
			</div>
		</div>

		<div class="relative z-[1] px-4 pb-4 flex flex-col flex-1 min-h-0 text-center">
			<div class="relative z-[1]">
				<RelayCard.Name class="text-base font-semibold mb-1" />
				<RelayCard.Url class="text-xs text-muted-foreground mb-3" showProtocol={false} />
				<RelayCard.Description maxLines={3} class="text-xs leading-relaxed" />

				<div class="mt-3 pt-3 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
					<span>Browse</span>
				</div>
			</div>
		</div>
	</button>
</RelayCard.Root>
