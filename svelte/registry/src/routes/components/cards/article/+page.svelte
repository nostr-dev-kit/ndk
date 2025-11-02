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
	import { BentoGrid, BentoGridItem } from '$lib/site-components/bento';
	import Demo from '$site-components/Demo.svelte';
	import PortraitGridPreview from './previews/portrait-grid-preview.svelte';
	import HeroPreview from './previews/hero-preview.svelte';
	import NeonPreview from './previews/neon-preview.svelte';
	import MediumFeedPreview from './previews/medium-feed-preview.svelte';

	// Import code examples
	import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
	import HeroCodeRaw from './examples/hero-code.svelte?raw';
	import MediumCodeRaw from './examples/medium-code.svelte?raw';
	import NeonCodeRaw from './examples/neon-code.svelte?raw';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UICompositionRaw from './examples/ui-composition.svelte?raw';

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
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-16">
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-5xl font-bold">Article Card</h1>
			{#key articles}
				<EditProps.Root>
					<EditProps.Prop name="Article 1" type="article" bind:value={article1} options={articles} />
					<EditProps.Prop name="Article 2" type="article" bind:value={article2} options={articles} />
					<EditProps.Prop name="Article 3" type="article" bind:value={article3} options={articles} />
					<EditProps.Button>Edit Props</EditProps.Button>
				</EditProps.Root>
			{/key}
		</div>
		<p class="text-xl text-muted-foreground mb-6">
			Display Nostr long-form articles with rich metadata and previews
		</p>
		<div class="text-base text-muted-foreground max-w-3xl space-y-3">
			<p>
				The Article Card component provides multiple ready-made variants for displaying NIP-23
				long-form content. Built using composable headless primitives, it supports article images,
				summaries, reading time estimation, and interactive navigation.
			</p>
			<p>
				Each variant is optimized for different layouts—from portrait cards to hero displays—while
				maintaining full customization through the underlying primitive layer.
			</p>
		</div>
	</div>

	<!-- Bento Grid Showcase -->
	<section class="mb-24">
		<h2 class="text-3xl font-bold mb-8">Showcase</h2>

		<BentoGrid>
			<!-- Portrait Grid (Large) -->
			<BentoGridItem class="md:col-span-2 md:row-span-2">
				{#snippet header()}
					<PortraitGridPreview />
				{/snippet}
			</BentoGridItem>

			<!-- Hero (Tall) -->
			<BentoGridItem class="md:col-span-1 md:row-span-2">
				{#snippet header()}
					<HeroPreview />
				{/snippet}
			</BentoGridItem>

			<!-- Medium Feed -->
			<BentoGridItem class="md:col-span-1">
				{#snippet header()}
					<MediumFeedPreview />
				{/snippet}
			</BentoGridItem>

			<!-- Neon -->
			<BentoGridItem class="md:col-span-2">
				{#snippet header()}
					<NeonPreview />
				{/snippet}
			</BentoGridItem>
		</BentoGrid>
	</section>

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
				<Demo
					title="ArticleCard.Portrait"
					description="Portrait-style article card with vertical layout. Ideal for grid layouts and featured content displays."
					component="article-card-portrait"
					code={PortraitCodeRaw}
				>
					<div class="flex gap-6 overflow-x-auto pb-4">
						{#each [article1, article2, article3].filter(Boolean) as article}
							<ArticleCardPortrait {ndk} {article} />
						{/each}
					</div>
				</Demo>

				<Demo
					title="ArticleCard.Hero"
					description="Hero-style article card with full-width image and overlay content. Perfect for featured articles."
					component="article-card-hero"
					code={HeroCodeRaw}
				>
					<div class="max-w-2xl">
						{#if article1}
							<ArticleCardHero {ndk} article={article1} />
						{/if}
					</div>
				</Demo>

				<Demo
					title="ArticleCard.Medium"
					description="Compact horizontal article card with side image. Ideal for article lists and feeds."
					component="article-card-medium"
					code={MediumCodeRaw}
				>
					<div class="space-y-4 max-w-2xl">
						{#each [article1, article2, article3].filter(Boolean) as article}
							<ArticleCardMedium {ndk} {article} />
						{/each}
					</div>
				</Demo>

				<Demo
					title="ArticleCard.Neon"
					description="Modern article card with vibrant neon accents and gradients."
					component="article-card-neon"
					code={NeonCodeRaw}
				>
					<div class="space-y-6 max-w-2xl">
						{#each [article1, article2].filter(Boolean) as article}
							<ArticleCardNeon {ndk} {article} />
						{/each}
					</div>
				</Demo>
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
