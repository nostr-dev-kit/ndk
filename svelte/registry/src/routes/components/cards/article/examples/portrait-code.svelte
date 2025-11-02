<Article.Root {ndk} {article}>
	<button
		type="button"
		class="group flex flex-col flex-shrink-0 w-[320px] h-[420px] rounded-2xl overflow-hidden bg-card hover:bg-muted transition-colors text-left"
	>
		<div class="relative h-56">
			<Article.Image class="w-full h-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
		</div>

		<div class="p-4 flex flex-col flex-1 min-h-0 text-left">
			<Article.Title class="text-base mb-2 leading-snug font-serif text-left line-clamp-2" />

			<Article.Summary
				class="text-xs mb-3 leading-relaxed flex-1 text-left line-clamp-3"
				maxLength={100}
			/>

			<div class="mt-auto pt-2 border-t border-border">
				<Article.ReadingTime class="text-xs" />
			</div>
		</div>
	</button>
</Article.Root>
