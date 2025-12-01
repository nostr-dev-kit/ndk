<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { ndk } from '$lib/site/ndk.svelte';
	import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
	import ArticleCardHero from '$lib/registry/components/article-card-hero/article-card-hero.svelte';
	import { fade, fly } from 'svelte/transition';
	let article = $state<NDKArticle | undefined>();

	$effect(() => {
		(async () => {
			try {
				const events = await ndk.fetchEvents({
					kinds: [NDKKind.Article],
					authors: [
						'6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93',
						...ndk.$follows
					],
					limit: 1
				});

				const articlesArray = Array.from(events)
					.map((event) => NDKArticle.from(event))
					.filter((a) => a.title && a.image);

				if (articlesArray.length > 0) {
					article = articlesArray[0];
				}
			} catch (error) {
				console.error('Failed to fetch articles:', error);
			}
		})();
	});
</script>

<div class="relative h-full w-full overflow-hidden min-h-[400px]">
	<!-- Background: Hero card (grayscale) -->
	<div class="absolute inset-0 flex items-center justify-center p-8 opacity-70">
		{#if article}
			{#key article}
				<div
					in:fly={{ y: 30, duration: 600 }}
					class="grayscale hover:grayscale-0 transition-all duration-500 scale-90"
				>
					<ArticleCardHero {ndk} event={article} />
				</div>
			{/key}
		{/if}
	</div>

	<!-- Dark gradient overlay for text contrast -->
	<div
		class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"
	></div>

	<!-- Text overlay -->
	<div in:fly={{ y: 20, duration: 600, delay: 400 }} class="absolute bottom-0 left-0 right-0 p-6 z-10">
		<h3 class="text-3xl font-bold text-white mb-2">Hero Display</h3>
		<p class="text-white/80 text-sm">Full-width featured article showcase</p>
	</div>
</div>
