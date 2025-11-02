<script lang="ts">
	import { Article } from '$lib/registry/ui/article';

	let { ndk, article } = $props();
</script>

<Article.Root {ndk} {article}>
	<div class="border border-border rounded-lg overflow-hidden bg-card max-w-sm">
		<Article.Image class="h-48 w-full object-cover" />
		<div class="p-4">
			<Article.Title class="text-xl mb-2 line-clamp-2" />
		</div>
	</div>
</Article.Root>
