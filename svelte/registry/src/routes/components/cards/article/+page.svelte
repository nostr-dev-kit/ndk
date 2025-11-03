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
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCardInline from '$site-components/ComponentCardInline.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let articles = $state<NDKArticle[]>([]);
	let loading = $state(true);
	let article1 = $state<NDKArticle | undefined>();
	let article2 = $state<NDKArticle | undefined>();
	let article3 = $state<NDKArticle | undefined>();

	// Fetch articles
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

	// Anatomy interaction state
	let selectedLayer = $state<string | null>(null);
	let focusedPrimitive = $state<string | null>(null);

	function toggleLayer(layerId: string) {
		selectedLayer = selectedLayer === layerId ? null : layerId;
	}

	function openPrimitiveDrawer(primitiveId: string) {
		focusedPrimitive = primitiveId;
	}

	function closePrimitiveDrawer() {
		focusedPrimitive = null;
	}

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

	const displayArticles = $derived(
		[article1, article2, article3].filter(Boolean) as NDKArticle[]
	);

	// Component card data for inline display
	const portraitCardData = {
		name: 'article-card-portrait',
		title: 'ArticleCardPortrait',
		description: 'Portrait-style layout with vertical orientation.',
		richDescription: 'Ideal for grid layouts and featured content displays. This card presents articles in a vertical portrait orientation with the image at the top, followed by title, summary, and reading time.',
		command: 'npx shadcn@latest add article-card-portrait',
		apiDocs: [
			{
				name: 'ArticleCardPortrait',
				description: 'Portrait-style article card component',
				importPath: "import { ArticleCardPortrait } from '$lib/registry/components/article-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const heroCardData = {
		name: 'article-card-hero',
		title: 'ArticleCardHero',
		description: 'Full-width hero card with overlay content.',
		richDescription: 'Perfect for featured articles and landing pages. This card uses the full width with an image background and overlay content including title and summary.',
		command: 'npx shadcn@latest add article-card-hero',
		apiDocs: [
			{
				name: 'ArticleCardHero',
				description: 'Hero-style article card component',
				importPath: "import { ArticleCardHero } from '$lib/registry/components/article-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const mediumCardData = {
		name: 'article-card-medium',
		title: 'ArticleCardMedium',
		description: 'Compact horizontal card with side image.',
		richDescription: 'Optimized for article lists and content feeds. This horizontal card layout places the image on the right side with title and metadata on the left, perfect for list views.',
		command: 'npx shadcn@latest add article-card-medium',
		apiDocs: [
			{
				name: 'ArticleCardMedium',
				description: 'Medium horizontal article card component',
				importPath: "import { ArticleCardMedium } from '$lib/registry/components/article-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const neonCardData = {
		name: 'article-card-neon',
		title: 'ArticleCardNeon',
		description: 'Modern design with vibrant neon accents and gradients.',
		richDescription: 'Striking visual impact with neon borders and gradient effects. This modern card design uses vibrant colors and glowing effects to make articles stand out.',
		command: 'npx shadcn@latest add article-card-neon',
		apiDocs: [
			{
				name: 'ArticleCardNeon',
				description: 'Neon-style article card component with vibrant accents',
				importPath: "import { ArticleCardNeon } from '$lib/registry/components/article-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">Article Card</h1>
		</div>
		<p class="text-lg text-muted-foreground mb-6">
			Display Nostr long-form articles with rich metadata and previews. Built using composable headless primitives with multiple ready-made variants optimized for different layouts.
		</p>

		{#key articles}
			<EditProps.Root>
				<EditProps.Prop name="Article 1" type="article" bind:value={article1} options={articles} />
				<EditProps.Prop name="Article 2" type="article" bind:value={article2} options={articles} />
				<EditProps.Prop name="Article 3" type="article" bind:value={article3} options={articles} />
				<EditProps.Button>Edit Examples</EditProps.Button>
			</EditProps.Root>
		{/key}
	</div>

	<!-- Blocks Showcase Section -->
	{#if !loading && article1}
		{#snippet portraitPreview()}
			{#if article1}
				<ArticleCardPortrait {ndk} article={article1} />
			{/if}
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
				{#each displayArticles.slice(0, 2) as article}
					<ArticleCardMedium {ndk} {article} />
				{/each}
			</div>
		{/snippet}

		{#snippet neonPreview()}
			{#if article1}
				<div class="w-full max-w-3xl">
					<ArticleCardNeon {ndk} article={article1} />
				</div>
			{/if}
		{/snippet}

		<ComponentsShowcase
			description="Beautifully crafted. Each optimized for its purpose. Choose the perfect presentation for your content."
			blocks={[
				{
					name: 'Portrait',
					description: 'Portrait-style layout with vertical orientation. Ideal for grid layouts and featured content displays.',
					command: 'npx shadcn@latest add article-card-portrait',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">ArticleCardPortrait</span> <span class="text-cyan-400">article</span><span class="text-gray-500">=&#123;</span>article<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: portraitPreview,
					cardData: portraitCardData
				},
				{
					name: 'Hero',
					description: 'Full-width hero card with overlay content. Perfect for featured articles and landing pages.',
					command: 'npx shadcn@latest add article-card-hero',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">ArticleCardHero</span> <span class="text-cyan-400">article</span><span class="text-gray-500">=&#123;</span>article<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: heroPreview,
					cardData: heroCardData
				},
				{
					name: 'Medium',
					description: 'Compact horizontal card with side image. Optimized for article lists and content feeds.',
					command: 'npx shadcn@latest add article-card-medium',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">ArticleCardMedium</span> <span class="text-cyan-400">article</span><span class="text-gray-500">=&#123;</span>article<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: mediumPreview,
					cardData: mediumCardData
				},
				{
					name: 'Neon',
					description: 'Modern design with vibrant neon accents and gradients. Striking visual impact.',
					command: 'npx shadcn@latest add article-card-neon',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">ArticleCardNeon</span> <span class="text-cyan-400">article</span><span class="text-gray-500">=&#123;</span>article<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: neonPreview,
					cardData: neonCardData
				}
			]}
		/>
	{/if}

	{#if !loading}

		<!-- Anatomy Section -->
		<section class="mb-24">
			<h2 class="text-3xl font-bold mb-4">Anatomy</h2>
			<p class="text-muted-foreground mb-8">Click on any layer to see its details and props</p>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
				<!-- Card Preview -->
				<div class="flex items-center justify-center lg:justify-end">
					<div class="max-w-md w-full relative">
						{#if article1}
							<!-- The actual card preview -->
							<div class="relative bg-card border border-border rounded-xl overflow-hidden">
								<Article.Root {ndk} article={article1}>
									<div class="relative h-48 overflow-hidden">
										<Article.Image class="w-full h-full object-cover" />
										<!-- Image Layer Overlay -->
										<button
											type="button"
											class="group absolute inset-0 border-2 border-dashed border-primary/60 transition-all cursor-pointer {selectedLayer ===
											'image'
												? 'bg-primary/20 border-primary'
												: 'hover:bg-primary/5'}"
											onclick={() => toggleLayer('image')}
										>
											<span
												class="absolute -bottom-8 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
											>
												Article.Image
											</span>
										</button>
									</div>

									<div class="p-4 space-y-3">
										<!-- Title Layer -->
										<div class="relative">
											<Article.Title class="text-lg font-semibold" />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {selectedLayer ===
												'title'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('title')}
											>
												<span
													class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
												>
													Article.Title
												</span>
											</button>
										</div>

										<!-- Summary Layer -->
										<div class="relative">
											<Article.Summary class="text-sm text-muted-foreground" maxLength={100} />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {selectedLayer ===
												'summary'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('summary')}
											>
												<span
													class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
												>
													Article.Summary
												</span>
											</button>
										</div>

										<!-- Reading Time Layer -->
										<div class="relative w-fit">
											<Article.ReadingTime class="text-xs text-muted-foreground" />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {selectedLayer ===
												'readingTime'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('readingTime')}
											>
												<span
													class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
												>
													Article.ReadingTime
												</span>
											</button>
										</div>
									</div>
								</Article.Root>
							</div>
						{/if}
					</div>
				</div>

				<!-- Detail Panel (Always Visible, Reserved Space) -->
				<div class="flex flex-col justify-start">
					{#if selectedLayer === 'image'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">Article.Image</h3>
							<p class="text-muted-foreground mb-4">
								Displays the article cover image with automatic loading states and fallback handling.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else if selectedLayer === 'title'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">Article.Title</h3>
							<p class="text-muted-foreground mb-4">
								Renders the article title from NDK article metadata.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else if selectedLayer === 'summary'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">Article.Summary</h3>
							<p class="text-muted-foreground mb-4">
								Shows article summary or excerpt with configurable length and truncation.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">maxLength</code>
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else if selectedLayer === 'readingTime'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">Article.ReadingTime</h3>
							<p class="text-muted-foreground mb-4">
								Calculates and displays estimated reading time based on content length.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">wordsPerMinute</code>
								<code class="bg-muted px-2 py-1 rounded text-sm">showSuffix</code>
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else}
						<div class="text-muted-foreground text-sm">
							Hover and click on a layer to see its details
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Components Section -->
		<section class="mb-24">
			<h2 class="text-3xl font-bold mb-8">Components</h2>

			<div class="space-y-12">
				{#if article1}
					<!-- Portrait -->
					<ComponentCardInline data={portraitCardData}>
						{#snippet preview()}
							<div class="flex gap-6 overflow-x-auto pb-4">
								{#each displayArticles as article}
									<ArticleCardPortrait {ndk} {article} />
								{/each}
							</div>
						{/snippet}
					</ComponentCardInline>

					<!-- Hero -->
					<ComponentCardInline data={heroCardData}>
						{#snippet preview()}
							<div class="max-w-2xl">
								<ArticleCardHero {ndk} article={article1} />
							</div>
						{/snippet}
					</ComponentCardInline>

					<!-- Medium -->
					<ComponentCardInline data={mediumCardData}>
						{#snippet preview()}
							<div class="space-y-4 max-w-2xl">
								{#each displayArticles as article}
									<ArticleCardMedium {ndk} {article} />
								{/each}
							</div>
						{/snippet}
					</ComponentCardInline>

					<!-- Neon -->
					<ComponentCardInline data={neonCardData}>
						{#snippet preview()}
							<div class="space-y-6 max-w-2xl">
								{#each displayArticles.slice(0, 2) as article}
									<ArticleCardNeon {ndk} {article} />
								{/each}
							</div>
						{/snippet}
					</ComponentCardInline>
				{/if}
			</div>
		</section>

		<!-- Primitives Grid -->
		<section class="mb-24">
			<h2 class="text-3xl font-bold mb-8">Primitives</h2>

			<div class="grid grid-cols-3">
				{#each Object.entries(primitiveData) as [id, data], i}
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
</div>

<!-- API Drawer -->
{#if focusedPrimitive && primitiveData[focusedPrimitive]}
	{@const data = primitiveData[focusedPrimitive]}
	<div
		class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
		onclick={closePrimitiveDrawer}
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
					{#each data.props as prop}
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
