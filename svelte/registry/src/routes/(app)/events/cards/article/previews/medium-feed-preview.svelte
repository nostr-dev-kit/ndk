<script lang="ts">
		import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
	import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
	import ArticleCardMedium from '$lib/registry/components/article-card/article-card-medium.svelte';
	import { fade, fly } from 'svelte/transition';
	let articles = $state<NDKArticle[]>([]);

	$effect(() => {
		(async () => {
			try {
				const events = await ndk.fetchEvents({
					kinds: [NDKKind.Article],
					authors: [
						'6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93',
						...ndk.$follows
					],
					limit: 3
				});

				articles = Array.from(events)
					.map((event) => NDKArticle.from(event))
					.filter((a) => a.title);
			} catch (error) {
				console.error('Failed to fetch articles:', error);
			}
		})();
	});
</script>

<div class="relative h-full w-full overflow-hidden min-h-[400px]">
	<!-- Background: Medium cards in horizontal feed (grayscale) -->
	<div class="absolute inset-0 flex gap-4 items-center p-6 opacity-70 overflow-x-auto">
		{#each articles.slice(0, 3) as article, i (article.id)}
			<div
				in:fade={{ duration: 500, delay: i * 150 }}
				class="grayscale hover:grayscale-0 transition-all duration-500 flex-shrink-0 scale-75"
			>
				<ArticleCardMedium {ndk} event={article} />
			</div>
		{/each}
	</div>

	<!-- Dark gradient overlay for text contrast -->
	<div
		class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"
	></div>

	<!-- Text overlay -->
	<div in:fly={{ y: 20, duration: 600, delay: 500 }} class="absolute bottom-0 left-0 right-0 p-6 z-10">
		<h3 class="text-3xl font-bold text-white mb-2">Medium Feed</h3>
		<p class="text-white/80 text-sm">Compact cards for content feeds</p>
	</div>
</div>
