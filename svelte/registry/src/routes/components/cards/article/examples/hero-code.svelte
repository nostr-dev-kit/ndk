<Article.Root {ndk} {article}>
	<button
		type="button"
		class="group relative w-full h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 text-left"
	>
		<Article.Image class="absolute inset-0 w-full h-full object-cover" />

		<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

		<div class="relative h-full flex flex-col justify-end p-8">
			<div class="mb-4">
				<span
					class="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase"
				>
					Featured
				</span>
			</div>

			<Article.Title
				class="text-5xl font-bold text-white mb-4 leading-tight line-clamp-3"
			/>

			<Article.Summary
				class="text-lg text-white/90 mb-6 leading-relaxed max-w-3xl line-clamp-2"
				maxLength={200}
			/>

			<div class="flex items-center gap-3 text-white/80">
				<Article.ReadingTime />
			</div>
		</div>
	</button>
</Article.Root>
