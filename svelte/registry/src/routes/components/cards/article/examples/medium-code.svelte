<ArticleCard.Root {ndk} {article}>
	<button
		type="button"
		class="group block w-full p-6 hover:bg-card/30 transition-colors border-b border-border last:border-b-0 text-left"
	>
		<div class="flex items-start gap-6">
			<div class="flex-1 min-w-0">
				<ArticleCard.Title class="text-2xl mb-2 font-serif" lines={2} />
				<ArticleCard.Summary
					class="text-base mb-4 leading-relaxed"
					maxLength={150}
					lines={3}
				/>
				<ArticleCard.Meta class="text-sm" showIcon={true} />
			</div>

			<div class="flex-shrink-0 w-48 h-36 rounded-lg overflow-hidden">
				<ArticleCard.Image class="w-full h-full" iconSize="w-10 h-10" />
			</div>
		</div>
	</button>
</ArticleCard.Root>
