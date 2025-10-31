<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
	import { ArticleCard } from '$lib/components/ndk/article-card';
	import {
		ArticleCardPortrait,
		ArticleCardHero,
		ArticleCardNeon,
		ArticleCardMedium
	} from '$lib/components/ndk/blocks';
	import { EditProps } from '$lib/components/ndk/edit-props';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import simplified code examples (for Code tab)
	import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
	import HeroCodeRaw from './examples/hero-code.svelte?raw';
	import NeonCodeRaw from './examples/neon-code.svelte?raw';
	import MediumCodeRaw from './examples/medium-code.svelte?raw';

	// Import UI component examples
	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UIComposition from './examples/ui-composition.svelte';
	import UICompositionRaw from './examples/ui-composition.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let articles = $state<NDKArticle[]>([]);
	let loading = $state(true);
	let article1 = $state<NDKArticle | undefined>();
	let article2 = $state<NDKArticle | undefined>();
	let article3 = $state<NDKArticle | undefined>();
	let article4 = $state<NDKArticle | undefined>();
	let article5 = $state<NDKArticle | undefined>();
	let mediumImageSize = $state<'small' | 'medium' | 'large'>('medium');

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

				// Initialize display articles from fetched articles
				if (articles.length > 0) {
					if (!article1) article1 = articles[0];
					if (!article2 && articles.length > 1) article2 = articles[1];
					if (!article3 && articles.length > 2) article3 = articles[2];
					if (!article4 && articles.length > 3) article4 = articles[3];
					if (!article5 && articles.length > 4) article5 = articles[4];
				}

				loading = false;
			} catch (error) {
				console.error('Failed to fetch articles:', error);
				loading = false;
			}
		})();
	});

	const displayArticles = $derived([article1, article2, article3, article4, article5].filter(Boolean) as NDKArticle[]);
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">ArticleCard</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Composable article card components for displaying NDKArticle content with customizable
			layouts.
		</p>

		{#key articles}
			<EditProps.Root>
				<EditProps.Prop name="Article 1" type="article" bind:value={article1} options={articles} />
				<EditProps.Prop name="Article 2" type="article" bind:value={article2} options={articles} />
				<EditProps.Prop name="Article 3" type="article" bind:value={article3} options={articles} />
				<EditProps.Prop name="Article 4" type="article" bind:value={article4} options={articles} />
				<EditProps.Prop name="Article 5" type="article" bind:value={article5} options={articles} />
			</EditProps.Root>
		{/key}
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading articles...</div>
		</div>
	{:else if articles.length === 0}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">No articles found. Using sample data...</div>
		</div>
	{/if}

	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<!-- Portrait -->
			<Demo
				title="Portrait"
				description="Vertical card layout with image on top. Perfect for grid displays and featured content."
				component="article-card-portrait"
				code={PortraitCodeRaw}
			>
				<div class="flex gap-6 overflow-x-auto pb-4">
					{#each displayArticles as article}
						<ArticleCardPortrait {ndk} {article} />
					{/each}
				</div>
			</Demo>

			<!-- Hero -->
			<Demo
				title="Hero"
				description="Full-width hero card with gradient background and featured badge. Ideal for featured stories and landing page headers."
				component="article-card-hero"
				code={HeroCodeRaw}
			>
				{#if article1}
					<ArticleCardHero {ndk} article={article1} />
				{/if}
			</Demo>

			<!-- Neon -->
			<Demo
				title="Neon"
				description="Portrait card with subtle glossy white neon top border, full background image, author info and reading time."
				component="article-card-neon"
				code={NeonCodeRaw}
			>
				<div class="flex gap-6 overflow-x-auto pb-4">
					{#each displayArticles as article}
						<ArticleCardNeon {ndk} {article} />
					{/each}
				</div>
			</Demo>

			<!-- Medium -->
			<Demo
				title="Medium"
				description="Horizontal card layout with image on right. Ideal for list views and article feeds. Supports three image size variants."
				component="article-card-medium"
				code={MediumCodeRaw}
			>
				{#snippet controls()}
					<label>
						Image Size:
						<select bind:value={mediumImageSize}>
							<option value="small">Small</option>
							<option value="medium">Medium</option>
							<option value="large">Large</option>
						</select>
					</label>
				{/snippet}

				<div class="space-y-0 border border-border rounded-lg overflow-hidden">
					{#each displayArticles.slice(0, 4) as article}
						<ArticleCardMedium {ndk} {article} imageSize={mediumImageSize} />
					{/each}
				</div>
			</Demo>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom article card layouts. Compose them together to
			create your own designs.
		</p>

		<div class="space-y-8">
			<!-- Basic -->
			<Demo
				title="Basic Usage"
				description="Minimal example with ArticleCard.Root and essential primitives."
				code={UIBasicRaw}
			>
				{#if article1}
					<UIBasic {ndk} article={article1} />
				{/if}
			</Demo>

			<!-- Full Composition -->
			<Demo
				title="Full Composition"
				description="All available primitives composed together."
				code={UICompositionRaw}
			>
				{#if article1}
					<UIComposition {ndk} article={article1} />
				{/if}
			</Demo>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'ArticleCard.Root',
				description:
					'Root container that provides context to child components. Fetches author profile automatically.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description:
							'NDK instance. Optional if NDK is available in Svelte context (from parent components).',
						required: false
					},
					{
						name: 'article',
						type: 'NDKArticle',
						description: 'The article to display',
						required: true
					},
					{
						name: 'interactive',
						type: 'boolean',
						default: 'false',
						description: 'Enable interactive features like click handlers',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.Image',
				description: 'Display article cover image with fallback icon.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'showGradient',
						type: 'boolean',
						default: 'false',
						description: 'Add a gradient overlay on the image',
						required: false
					},
					{
						name: 'iconSize',
						type: 'string',
						default: '"w-16 h-16"',
						description: 'Tailwind classes for fallback icon size',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.Title',
				description: 'Display article title with line clamping.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'lines',
						type: 'number',
						default: '2',
						description: 'Maximum number of lines to display',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.Summary',
				description: 'Display article summary/excerpt with truncation.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'maxLength',
						type: 'number',
						default: '150',
						description: 'Maximum character length before truncation',
						required: false
					},
					{
						name: 'lines',
						type: 'number',
						default: '3',
						description: 'Maximum number of lines to display',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.Author',
				description: 'Display article author name from profile.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'fallback',
						type: 'string',
						default: '"Anonymous"',
						description: 'Fallback text when author name is unavailable',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.Date',
				description: 'Display article published date.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'format',
						type: '"relative" | "short" | "full"',
						default: '"relative"',
						description: 'Date format style',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.Meta',
				description: 'Combined author + date display.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'showIcon',
						type: 'boolean',
						default: 'false',
						description: 'Show author avatar icon',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCard.ReadingTime',
				description: 'Display estimated reading time based on article content length.',
				importPath: "import { ArticleCard } from '$lib/components/ndk/article-card'",
				props: [
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'ArticleCardPortrait',
				description:
					'Preset: Vertical card with image on top. Import from $lib/ndk/blocks for quick use.',
				importPath: "import { ArticleCardPortrait } from '$lib/components/ndk/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'article',
						type: 'NDKArticle',
						description: 'The article to display',
						required: true
					},
					{
						name: 'width',
						type: 'string',
						default: '"w-[320px]"',
						description: 'Card width (Tailwind classes)',
						required: false
					},
					{
						name: 'height',
						type: 'string',
						default: '"h-[420px]"',
						description: 'Card height (Tailwind classes)',
						required: false
					},
					{
						name: 'imageHeight',
						type: 'string',
						default: '"h-56"',
						description: 'Image height (Tailwind classes)',
						required: false
					}
				]
			},
			{
				name: 'ArticleCardHero',
				description:
					'Preset: Full-width hero card with gradient background and optional badge. Import from $lib/ndk/blocks.',
				importPath: "import { ArticleCardHero } from '$lib/components/ndk/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'article',
						type: 'NDKArticle',
						description: 'The article to display',
						required: true
					},
					{
						name: 'height',
						type: 'string',
						default: '"h-[500px]"',
						description: 'Hero section height (Tailwind classes)',
						required: false
					},
					{
						name: 'badgeText',
						type: 'string',
						description: 'Optional badge text (badge shown if provided)',
						required: false
					}
				]
			},
			{
				name: 'ArticleCardNeon',
				description:
					'Preset: Portrait card with subtle glossy white neon top border effect, full background image. Import from $lib/ndk/blocks.',
				importPath: "import { ArticleCardNeon } from '$lib/components/ndk/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'article',
						type: 'NDKArticle',
						description: 'The article to display',
						required: true
					},
					{
						name: 'width',
						type: 'string',
						default: '"w-[320px]"',
						description: 'Card width (Tailwind classes)',
						required: false
					},
					{
						name: 'height',
						type: 'string',
						default: '"h-[480px]"',
						description: 'Card height (Tailwind classes)',
						required: false
					}
				]
			},
			{
				name: 'ArticleCardMedium',
				description:
					'Preset: Horizontal card with image on right. Supports three image size variants. Import from $lib/ndk/blocks.',
				importPath: "import { ArticleCardMedium } from '$lib/components/ndk/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'article',
						type: 'NDKArticle',
						description: 'The article to display',
						required: true
					},
					{
						name: 'imageSize',
						type: '"small" | "medium" | "large"',
						default: '"medium"',
						description: 'Image size variant',
						required: false
					}
				]
			}
		]}
	/>
</div>
