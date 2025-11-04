<Relay.Root {ndk} {relayUrl}>
	<button type="button" class="group flex flex-col w-[360px] h-[420px] rounded-2xl bg-card hover:bg-muted border border-border transition-colors text-left relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">
		<!-- Background Icon with Gradient - covers entire card -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 scale-[2.5]">
				<Relay.Icon class="w-[200px] h-[200px]" />
			</div>
			<div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15"></div>
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-card/60"></div>
			<div class="absolute inset-0 backdrop-blur-sm"></div>
		</div>

		<div class="absolute top-3 right-3 z-10">
			<Relay.BookmarkButton {bookmarks} size="sm" />
		</div>

		<div class="relative flex items-center justify-center pt-8 pb-4 z-[1]">
			<div class="relative">
				<div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
				<Relay.Icon class="relative z-[1] w-20 h-20" />
			</div>
		</div>

		<div class="relative z-[1] px-6 pb-6 flex flex-col flex-1 min-h-0 text-center">
			<div class="relative z-[1] flex flex-col flex-1">
				<Relay.Name class="text-lg font-semibold mb-1" />
				<Relay.Url class="text-sm text-muted-foreground mb-3" showProtocol={false} />
				<Relay.Description maxLines={3} class="text-sm leading-relaxed mb-4" />

				<div class="mt-auto pt-4 border-t border-border/50">
					<div class="flex items-center justify-center gap-1 text-sm text-primary">
						<span>Browse</span>
						<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	</button>
</Relay.Root>
