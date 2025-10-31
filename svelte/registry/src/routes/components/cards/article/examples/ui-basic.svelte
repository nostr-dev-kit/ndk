<script lang="ts">
	import { ArticleCard } from '$lib/components/ndk/article-card';

	let { ndk, article } = $props();
</script>

<ArticleCard.Root {ndk} {article}>
	<div class="border border-border rounded-lg overflow-hidden bg-card max-w-sm">
		<ArticleCard.Image class="h-48" />
		<div class="p-4">
			<ArticleCard.Title class="text-xl mb-2" />
		</div>
	</div>
</ArticleCard.Root>
