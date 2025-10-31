<script lang="ts">
	import { ArticleCard } from '$lib/components/ndk/article-card';

	let { ndk, article } = $props();
</script>

<ArticleCard.Root {ndk} {article}>
	<div class="border border-border rounded-xl overflow-hidden bg-card max-w-2xl">
		<ArticleCard.Image class="h-64" showGradient={true} />
		<div class="p-6">
			<ArticleCard.Title class="text-3xl mb-3" lines={3} />
			<ArticleCard.Summary class="text-base mb-4" maxLength={250} lines={4} />
			<div class="flex items-center justify-between pt-4 border-t border-border">
				<ArticleCard.Meta showIcon={true} />
				<button
					class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Read Article
				</button>
			</div>
		</div>
	</div>
</ArticleCard.Root>
