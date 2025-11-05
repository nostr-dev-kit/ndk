<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
	import { Article } from '$lib/registry/ui/article';
	import ArticleCardPortrait from '$lib/registry/components/article-card/article-card-portrait.svelte';
	import ArticleCardHero from '$lib/registry/components/article-card/article-card-hero.svelte';
	import ArticleCardNeon from '$lib/registry/components/article-card/article-card-neon.svelte';
	import ArticleCardMedium from '$lib/registry/components/article-card/article-card-medium.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import { ScrollArea } from '$lib/site-components/ui/scroll-area';
	import * as ComponentAnatomy from '$site-components/component-anatomy';
	import SectionTitle from '$site-components/SectionTitle.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { articleCardMetadata, articleCardCards } from '$lib/component-registry/article-card';
	import type { ShowcaseBlock } from '$lib/templates/types';

	const ndk = getContext<NDKSvelte>('ndk');

	let articles = $state<NDKArticle[]>([]);
	let loading = $state(true);
	let article1 = $state<NDKArticle | undefined>();
	let article2 = $state<NDKArticle | undefined>();
	let article3 = $state<NDKArticle | undefined>();

	$effect(() => {
		(async () => {
			try {
				const events = await ndk.fetchEvents({
					kinds: [NDKKind.Article],
					authors: [
						'6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93',
						...ndk.$follows
					],
					limit: 10
				});

				articles = Array.from(events)
					.map((event) => NDKArticle.from(event))
					.filter((a) => a.title);

				if (articles.length > 0) {
					if (!article1) article1 = articles[0];
					if (!article2 && articles.length > 1) article2 = articles[1];
					if (!article3 && articles.length > 2) article3 = articles[2];
				}

				loading = false;
			} catch (error) {
				console.error('Failed to fetch articles:', error);
				loading = false;
			}
		})();
	});

	const displayArticles = $derived(
		[article1, article2, article3].filter(Boolean) as NDKArticle[]
	);

	let focusedPrimitive = $state<string | null>(null);

	function openPrimitiveDrawer(primitiveId: string) {
		focusedPrimitive = primitiveId;
	}

	function closePrimitiveDrawer() {
		focusedPrimitive = null;
	}

	const anatomyLayers: Record<string, ComponentAnatomy.AnatomyLayer> = {
		image: {
			id: 'image',
			label: 'Article.Image',
			description: 'Displays the article cover image with automatic loading states and fallback handling.',
			props: ['class']
		},
		title: {
			id: 'title',
			label: 'Article.Title',
			description: 'Renders the article title from NDK article metadata.',
			props: ['class']
		},
		summary: {
			id: 'summary',
			label: 'Article.Summary',
			description: 'Shows article summary or excerpt with configurable length and truncation.',
			props: ['maxLength', 'class']
		},
		readingTime: {
			id: 'readingTime',
			label: 'Article.ReadingTime',
			description: 'Calculates and displays estimated reading time based on content length.',
			props: ['wordsPerMinute', 'showSuffix', 'class']
		}
	};

	const primitiveData = {
		root: {
			name: 'Article.Root',
			description:
				'Root container component that provides article context and manages state for all child primitives. Must wrap all other Article primitives.',
			props: [
				{ name: 'ndk', type: 'NDKSvelte', desc: 'NDK instance (optional, falls back to context)' },
				{ name: 'article', type: 'NDKArticle', desc: 'Article instance to display' },
				{ name: 'onclick', type: '(e: MouseEvent) => void', desc: 'Click handler for the article' },
				{ name: 'class', type: 'string', desc: 'Additional CSS classes' }
			]
		},
		image: {
			name: 'Article.Image',
			description: 'Displays article cover image with lazy loading and automatic fallback handling.',
			props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes for styling' }]
		},
		title: {
			name: 'Article.Title',
			description: 'Renders the article title from NDK article metadata.',
			props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
		},
		summary: {
			name: 'Article.Summary',
			description: 'Shows article summary or excerpt with configurable length and truncation.',
			props: [
				{ name: 'maxLength', type: 'number', desc: 'Maximum character length (default: 150)' },
				{ name: 'class', type: 'string', desc: 'Additional CSS classes' }
			]
		},
		readingTime: {
			name: 'Article.ReadingTime',
			description:
				'Calculates and displays estimated reading time based on content length.',
			props: [
				{ name: 'wordsPerMinute', type: 'number', desc: 'Reading speed (default: 200)' },
				{ name: 'showSuffix', type: 'boolean', desc: 'Show "min read" suffix (default: true)' },
				{ name: 'class', type: 'string', desc: 'Additional CSS classes' }
			]
		}
	};

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Portrait',
			description: 'Portrait-style layout with vertical orientation. Ideal for grid layouts and featured content displays.',
			command: 'npx shadcn@latest add article-card-portrait',
			preview: portraitPreview,
			cardData: articleCardCards[0],
			orientation: 'horizontal'
		},
		{
			name: 'Hero',
			description: 'Full-width hero card with overlay content. Perfect for featured articles and landing pages.',
			command: 'npx shadcn@latest add article-card-hero',
			preview: heroPreview,
			cardData: articleCardCards[1],
			orientation: 'vertical'
		},
		{
			name: 'Medium',
			description: 'Compact horizontal card with side image. Optimized for article lists and content feeds.',
			command: 'npx shadcn@latest add article-card-medium',
			preview: mediumPreview,
			cardData: articleCardCards[2],
			orientation: 'vertical'
		},
		{
			name: 'Neon',
			description: 'Modern design with vibrant neon accents and gradients. Striking visual impact.',
			command: 'npx shadcn@latest add article-card-neon',
			preview: neonPreview,
			cardData: articleCardCards[3],
			orientation: 'vertical'
		}
	];
</script>
{#snippet portraitPreview()}
	<ScrollArea orientation="horizontal" class="w-full">
		<div class="flex gap-6 pb-4">
			{#each displayArticles as article (article.id)}
				<ArticleCardPortrait {ndk} {article} />
			{/each}
		</div>
	</ScrollArea>
{/snippet}

{#snippet heroPreview()}
	{#if article1}
		<div class="min-w-[800px]">
			<ArticleCardHero {ndk} article={article1} />
		</div>
	{/if}
{/snippet}

{#snippet mediumPreview()}
	<div class="w-full max-w-3xl space-y-4">
		{#each displayArticles.slice(0, 2) as article (article.id)}
			<ArticleCardMedium {ndk} {article} />
		{/each}
	</div>
{/snippet}

{#snippet neonPreview()}
	<ScrollArea orientation="horizontal" class="w-full">
		<div class="flex gap-6 pb-4">
			{#each displayArticles as article (article.id)}
				<ArticleCardNeon {ndk} {article} />
			{/each}
		</div>
	</ScrollArea>
{/snippet}

{#snippet portraitComponentPreview()}
	<ScrollArea orientation="horizontal" class="w-full">
		<div class="flex gap-6 pb-4">
			{#each displayArticles as article (article.id)}
				<ArticleCardPortrait {ndk} {article} />
			{/each}
		</div>
	</ScrollArea>
{/snippet}

{#snippet heroComponentPreview()}
	<div class="max-w-2xl mx-auto">
		{#if article1}
			<ArticleCardHero {ndk} article={article1} />
		{/if}
	</div>
{/snippet}

{#snippet mediumComponentPreview()}
	<div class="space-y-4 max-w-2xl mx-auto">
		{#each displayArticles as article (article.id)}
			<ArticleCardMedium {ndk} {article} />
		{/each}
	</div>
{/snippet}

{#snippet neonComponentPreview()}
	<ScrollArea orientation="horizontal" class="w-full">
		<div class="flex gap-6 pb-4">
			{#each displayArticles as article (article.id)}
				<ArticleCardNeon {ndk} {article} />
			{/each}
		</div>
	</ScrollArea>
{/snippet}

{#snippet customSections()}
	{#if !loading}
		<!-- Anatomy Section -->
		<SectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

		<ComponentAnatomy.Root>
			<ComponentAnatomy.Preview>
				{#if article1}
					<div class="relative bg-card border border-border rounded-xl overflow-hidden">
						<Article.Root {ndk} article={article1}>
							<ComponentAnatomy.Layer id="image" label="Article.Image" class="h-48 overflow-hidden" absolute={true}>
								<Article.Image class="w-full h-full object-cover" />
							</ComponentAnatomy.Layer>

							<div class="p-4 space-y-3">
								<ComponentAnatomy.Layer id="title" label="Article.Title">
									<Article.Title class="text-lg font-semibold" />
								</ComponentAnatomy.Layer>

								<ComponentAnatomy.Layer id="summary" label="Article.Summary">
									<Article.Summary class="text-sm text-muted-foreground" maxLength={100} />
								</ComponentAnatomy.Layer>

								<ComponentAnatomy.Layer id="readingTime" label="Article.ReadingTime" class="w-fit">
									<Article.ReadingTime class="text-xs text-muted-foreground" />
								</ComponentAnatomy.Layer>
							</div>
						</Article.Root>
					</div>
				{/if}
			</ComponentAnatomy.Preview>

			<ComponentAnatomy.DetailPanel layers={anatomyLayers} />
		</ComponentAnatomy.Root>

		<!-- Primitives Grid -->
		<SectionTitle title="Primitives" />

		<section class="min-h-[500px] lg:min-h-[60vh] pb-12">

			<div class="grid grid-cols-3">
				{#each Object.entries(primitiveData) as [id, data], i (id)}
					<button
						type="button"
						class="p-12 border-border transition-all {i % 3 !== 2
							? 'border-r'
							: ''} {i < 3 ? 'border-b' : ''} {focusedPrimitive && focusedPrimitive !== id
							? 'opacity-30'
							: ''}"
						onclick={() => openPrimitiveDrawer(id)}
					>
						<div class="flex flex-col items-center justify-start">
							<h3 class="text-base font-semibold text-foreground mb-4">{data.name}</h3>
							<div class="border border-dashed border-border rounded-lg p-6 w-full min-h-[240px] flex items-center justify-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
								{#if article1}
									<Article.Root {ndk} article={article1}>
										{#if id === 'root'}
											<div class="text-center">
												<div class="font-semibold text-foreground mb-1">Container Component</div>
												<div class="text-sm text-muted-foreground">Wraps all primitives</div>
											</div>
										{:else if id === 'image'}
											<Article.Image class="w-full h-full object-cover rounded" />
										{:else if id === 'title'}
											<Article.Title class="text-xl font-bold text-center" />
										{:else if id === 'summary'}
											<Article.Summary
												class="text-sm text-muted-foreground text-center leading-relaxed px-2"
												maxLength={100}
											/>
										{:else if id === 'readingTime'}
											<Article.ReadingTime class="text-base text-foreground" />
										{/if}
									</Article.Root>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}
{/snippet}

{#if !loading && article1}
	<ComponentPageTemplate
		metadata={articleCardMetadata}
		{ndk}
		{showcaseBlocks}componentsSection={{
			cards: articleCardCards,
			previews: {
				'article-card-portrait': portraitComponentPreview,
				'article-card-hero': heroComponentPreview,
				'article-card-medium': mediumComponentPreview,
				'article-card-neon': neonComponentPreview
			}
		}}
		{customSections}
	>
    <EditProps.Prop name="Article 1" type="article" bind:value={article1} options={articles} />
			<EditProps.Prop name="Article 2" type="article" bind:value={article2} options={articles} />
			<EditProps.Prop name="Article 3" type="article" bind:value={article3} options={articles} />
  </ComponentPageTemplate>
{:else if loading}
	<div class="px-8 py-16 text-center text-muted-foreground">
		Loading articles...
	</div>
{:else}
	<div class="px-8 py-16 text-center text-muted-foreground">
		No articles found
	</div>
{/if}

<!-- API Drawer -->
{#if focusedPrimitive && primitiveData[focusedPrimitive]}
	{@const data = primitiveData[focusedPrimitive]}
	<div
		class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
		onclick={closePrimitiveDrawer}
		onkeydown={(e) => e.key === 'Escape' && closePrimitiveDrawer()}
		role="button"
		tabindex="-1"
	></div>
	<div
		class="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
	>
		<div class="sticky top-0 bg-card border-b border-border p-8 z-10">
			<button
				type="button"
				class="absolute top-8 right-8 text-muted-foreground hover:text-foreground text-2xl"
				onclick={closePrimitiveDrawer}
			>
				×
			</button>
			<h2 class="font-mono text-2xl font-bold text-primary">{data.name}</h2>
		</div>

		<div class="p-8">
			<div class="mb-8">
				<p class="text-muted-foreground leading-relaxed">{data.description}</p>
			</div>

			<div>
				<h3 class="text-lg font-bold mb-4">Props</h3>
				<div class="space-y-4">
					{#each data.props as prop (prop.name)}
						<div class="bg-muted/50 border border-border rounded-lg p-4">
							<div class="flex justify-between items-start mb-2">
								<code class="font-mono font-semibold text-primary">{prop.name}</code>
								<code class="font-mono text-xs text-muted-foreground">{prop.type}</code>
							</div>
							<p class="text-sm text-muted-foreground">{prop.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
