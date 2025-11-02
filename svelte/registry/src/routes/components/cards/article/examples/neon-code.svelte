<Article.Root {ndk} {article}>
	<button
		type="button"
		class="group relative flex flex-col flex-shrink-0 w-[320px] h-[480px] overflow-hidden rounded-2xl text-left"
	>
		<div
			class="absolute top-0 left-0 right-0 h-[3px] z-20 bg-gradient-to-b from-white/40 via-white/10 to-transparent shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6),inset_0_2px_3px_0_rgba(255,255,255,0.3)]"
		></div>

		<div class="absolute inset-0 z-0">
			<Article.Image class="absolute inset-0 w-full h-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90"></div>
		</div>

		<div class="relative z-10 flex flex-col h-full p-6">
			<div class="flex items-start justify-between mb-auto">
				<div
					class="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center"
				>
					<!-- Icon placeholder -->
				</div>
			</div>

			<div class="mt-auto space-y-4">
				<div>
					<Article.Title class="text-xl font-bold text-white mb-2 leading-tight line-clamp-2" />
					<Article.Summary
						class="text-sm text-white/80 leading-relaxed line-clamp-2"
						maxLength={100}
					/>
				</div>

				<div class="pt-4 border-t border-white/10">
					<UserProfile.AvatarName
						{ndk}
						user={article.author}
						avatarSize={36}
						class="text-white [&_.text-muted-foreground]:text-white/70 [&_img]:ring-2 [&_img]:ring-white/20"
					>
						{#snippet meta()}
							<Article.ReadingTime class="text-xs text-white/70" />
						{/snippet}
					</UserProfile.AvatarName>
				</div>
			</div>
		</div>
	</button>
</Article.Root>
