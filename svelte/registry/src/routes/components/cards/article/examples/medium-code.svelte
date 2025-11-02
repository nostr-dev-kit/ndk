<Article.Root {ndk} {article}>
	<button
		type="button"
		class="group block w-full p-6 hover:bg-card/30 transition-colors border-b border-border last:border-b-0 text-left"
	>
		<div class="flex items-start gap-6">
			<div class="flex-1 min-w-0">
				<Article.Title class="text-2xl mb-2 font-serif line-clamp-2" />
				<Article.Summary
					class="text-base mb-4 leading-relaxed line-clamp-3"
					maxLength={150}
				/>
				<Article.ReadingTime class="text-sm" />
			</div>

			<div class="flex-shrink-0 w-48 h-36 rounded-lg overflow-hidden">
				<Article.Image class="w-full h-full object-cover" />
			</div>
		</div>
	</button>
</Article.Root>
