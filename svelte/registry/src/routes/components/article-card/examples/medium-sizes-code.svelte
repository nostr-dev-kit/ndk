<!-- Small -->
<ArticleCard.Root {ndk} {article}>
	<div class="block w-full p-6 border-b border-border text-left">
		<div class="flex items-start gap-6">
			<div class="flex-1 min-w-0">
				<ArticleCard.Title class="text-2xl mb-2 font-serif" lines={2} />
				<ArticleCard.Summary class="text-base mb-4 leading-relaxed" maxLength={150} lines={3} />
				<ArticleCard.Meta class="text-sm" showIcon={true} />
			</div>
			<div class="flex-shrink-0 w-36 h-28 rounded-lg overflow-hidden">
				<ArticleCard.Image class="w-full h-full" />
			</div>
		</div>
	</div>
</ArticleCard.Root>

<!-- Medium -->
<ArticleCard.Root {ndk} {article}>
	<div class="block w-full p-6 border-b border-border text-left">
		<div class="flex items-start gap-6">
			<div class="flex-1 min-w-0">
				<ArticleCard.Title class="text-2xl mb-2 font-serif" lines={2} />
				<ArticleCard.Summary class="text-base mb-4 leading-relaxed" maxLength={150} lines={3} />
				<ArticleCard.Meta class="text-sm" showIcon={true} />
			</div>
			<div class="flex-shrink-0 w-48 h-36 rounded-lg overflow-hidden">
				<ArticleCard.Image class="w-full h-full" />
			</div>
		</div>
	</div>
</ArticleCard.Root>

<!-- Large -->
<ArticleCard.Root {ndk} {article}>
	<div class="block w-full p-6 text-left">
		<div class="flex items-start gap-6">
			<div class="flex-1 min-w-0">
				<ArticleCard.Title class="text-2xl mb-2 font-serif" lines={2} />
				<ArticleCard.Summary class="text-base mb-4 leading-relaxed" maxLength={150} lines={3} />
				<ArticleCard.Meta class="text-sm" showIcon={true} />
			</div>
			<div class="flex-shrink-0 w-56 h-40 rounded-lg overflow-hidden">
				<ArticleCard.Image class="w-full h-full" />
			</div>
		</div>
	</div>
</ArticleCard.Root>
