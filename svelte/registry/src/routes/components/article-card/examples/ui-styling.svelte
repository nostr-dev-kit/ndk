<script lang="ts">
	import { ArticleCard } from '$lib/ndk/article-card';

	let { ndk, article } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
	<!-- Minimal Style -->
	<ArticleCard.Root {ndk} {article}>
		<div class="bg-background p-6 rounded-lg">
			<ArticleCard.Title class="text-2xl font-bold mb-2" lines={2} />
			<ArticleCard.Summary class="text-muted-foreground mb-4" maxLength={120} lines={2} />
			<ArticleCard.Date format="short" class="text-sm text-muted-foreground" />
		</div>
	</ArticleCard.Root>

	<!-- Card with Shadow -->
	<ArticleCard.Root {ndk} {article}>
		<div class="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
			<ArticleCard.Title class="text-xl font-semibold mb-3" lines={2} />
			<ArticleCard.Author class="text-sm text-primary mb-2" />
			<ArticleCard.Summary class="text-sm text-muted-foreground" maxLength={100} lines={3} />
		</div>
	</ArticleCard.Root>

	<!-- Gradient Background -->
	<ArticleCard.Root {ndk} {article}>
		<div class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-2xl">
			<ArticleCard.Title class="text-xl font-bold mb-2 text-purple-900 dark:text-purple-100" lines={2} />
			<ArticleCard.Summary class="text-purple-700 dark:text-purple-300 mb-4" maxLength={100} lines={2} />
			<div class="flex items-center gap-3">
				<ArticleCard.Author class="text-sm font-medium" />
				<span class="text-purple-400">•</span>
				<ArticleCard.ReadingTime class="text-sm text-purple-600 dark:text-purple-400" />
			</div>
		</div>
	</ArticleCard.Root>

	<!-- Bordered Style -->
	<ArticleCard.Root {ndk} {article}>
		<div class="border-2 border-primary rounded-lg p-6 bg-card/50 backdrop-blur-sm">
			<div class="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
				Article
			</div>
			<ArticleCard.Title class="text-lg font-bold mb-2" lines={2} />
			<ArticleCard.Summary class="text-sm text-muted-foreground mb-3" maxLength={100} lines={2} />
			<ArticleCard.Meta class="text-xs" />
		</div>
	</ArticleCard.Root>
</div>
