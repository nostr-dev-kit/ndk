<ArticleCard.Root {ndk} {article}>
	<button
		type="button"
		class="group flex flex-col flex-shrink-0 w-[320px] h-[420px] rounded-2xl overflow-hidden bg-card hover:bg-muted transition-colors text-left"
	>
		<ArticleCard.Image class="h-56" showGradient={true} />

		<div class="p-4 flex flex-col flex-1 min-h-0 text-left">
			<ArticleCard.Title class="text-base mb-2 leading-snug font-serif text-left" lines={2} />

			<ArticleCard.Summary
				class="text-xs mb-3 leading-relaxed flex-1 text-left"
				maxLength={100}
				lines={3}
			/>

			<div class="mt-auto pt-2 border-t border-border">
				<ArticleCard.Meta class="text-xs" />
			</div>
		</div>
	</button>
</ArticleCard.Root>
