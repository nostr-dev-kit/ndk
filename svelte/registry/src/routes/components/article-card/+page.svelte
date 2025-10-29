<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
	import { ArticleCard } from '$lib/ndk/article-card';
	import {
		ArticleCardPortrait,
		ArticleCardHero,
		ArticleCardNeon,
		ArticleCardMedium
	} from '$lib/ndk/blocks';
	import { EditProps } from '$lib/ndk/edit-props';
	import BlockExample from '$site-components/block-example.svelte';
	import UIExample from '$site-components/ui-example.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import simplified code examples (for Code tab)
	import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
	import HeroCodeRaw from './examples/hero-code.svelte?raw';
	import NeonCodeRaw from './examples/neon-code.svelte?raw';
	import MediumCodeRaw from './examples/medium-code.svelte?raw';
	import MediumSizesCodeRaw from './examples/medium-sizes-code.svelte?raw';

	// Import UI component examples
	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UIComposition from './examples/ui-composition.svelte';
	import UICompositionRaw from './examples/ui-composition.svelte?raw';
	import UIStyling from './examples/ui-styling.svelte';
	import UIStylingRaw from './examples/ui-styling.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let articles = $state<NDKArticle[]>([]);
	let loading = $state(true);
	let sampleArticle = $state<NDKArticle | undefined>();

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

				if (!sampleArticle && articles.length > 0) {
					sampleArticle = articles[0];
				}

				loading = false;
			} catch (error) {
				console.error('Failed to fetch articles:', error);
				loading = false;
			}
		})();
	});

	const displayArticle = $derived(sampleArticle);
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">ArticleCard</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Composable article card components for displaying NDKArticle content with customizable
			layouts.
		</p>

		<EditProps.Root>
			<EditProps.Prop name="Sample Article" type="article" bind:value={sampleArticle} />
		</EditProps.Root>
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
			<BlockExample
				title="Portrait"
				description="Vertical card layout with image on top. Perfect for grid displays and featured content."
				component="article-card-portrait"
				code={PortraitCodeRaw}
			>
				<div class="flex gap-6 overflow-x-auto pb-4">
					{#if displayArticle}
						<ArticleCardPortrait {ndk} article={displayArticle} />
					{/if}
					{#each articles.slice(0, 4) as article}
						<ArticleCardPortrait {ndk} {article} />
					{/each}
				</div>
			</BlockExample>

			<!-- Hero -->
			<BlockExample
				title="Hero"
				description="Full-width hero card with gradient background and featured badge. Ideal for featured stories and landing page headers."
				component="article-card-hero"
				code={HeroCodeRaw}
			>
				{#if displayArticle}
					<ArticleCardHero {ndk} article={displayArticle} />
				{/if}
			</BlockExample>

			<!-- Neon -->
			<BlockExample
				title="Neon"
				description="Portrait card with subtle glossy white neon top border, full background image, author info and reading time."
				component="article-card-neon"
				code={NeonCodeRaw}
			>
				<div class="flex gap-6 overflow-x-auto pb-4">
					{#if displayArticle}
						<ArticleCardNeon {ndk} article={displayArticle} />
					{/if}
					{#each articles.slice(0, 4) as article}
						<ArticleCardNeon {ndk} {article} />
					{/each}
				</div>
			</BlockExample>

			<!-- Medium -->
			<div>
				<BlockExample
					title="Medium"
					description="Horizontal card layout with image on right. Ideal for list views and article feeds."
					component="article-card-medium"
					code={MediumCodeRaw}
				>
					<div class="space-y-0 border border-border rounded-lg overflow-hidden">
						{#if displayArticle}
							<ArticleCardMedium {ndk} article={displayArticle} />
						{/if}
						{#each articles.slice(0, 3) as article}
							<ArticleCardMedium {ndk} {article} />
						{/each}
					</div>
				</BlockExample>

				<!-- Sizes subsection -->
				<div class="mt-8 ml-8 border-l-2 border-border pl-8">
					<h4 class="text-xl font-semibold mb-4">Sizes</h4>
					<BlockExample
						description="Medium layout supports three image size options: small, medium, and large."
						component="article-card-medium"
						code={MediumSizesCodeRaw}
					>
						<div class="space-y-0 border border-border rounded-lg overflow-hidden">
							{#if displayArticle}
								<ArticleCardMedium {ndk} article={displayArticle} imageSize="small" />
								<ArticleCardMedium {ndk} article={displayArticle} imageSize="medium" />
								<ArticleCardMedium {ndk} article={displayArticle} imageSize="large" />
							{/if}
						</div>
					</BlockExample>
				</div>
			</div>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom article card layouts. Mix and match to create your
			own designs.
		</p>

		<div class="space-y-8">
			<!-- Basic -->
			<UIExample
				title="Basic Usage"
				description="Start with ArticleCard.Root and add primitive components."
				code={UIBasicRaw}
			>
				{#if displayArticle}
					<UIBasic {ndk} article={displayArticle} />
				{/if}
			</UIExample>

			<!-- Composition -->
			<UIExample
				title="Full Composition"
				description="Combine multiple primitives to create rich card layouts."
				code={UICompositionRaw}
			>
				{#if displayArticle}
					<UIComposition {ndk} article={displayArticle} />
				{/if}
			</UIExample>

			<!-- Styling -->
			<UIExample
				title="Custom Styling"
				description="Apply your own Tailwind classes to create unique designs."
				code={UIStylingRaw}
			>
				{#if displayArticle}
					<UIStyling {ndk} article={displayArticle} />
				{/if}
			</UIExample>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'ArticleCard.Root',
				description:
					'Root container that provides context to child components. Fetches author profile automatically.',
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCard } from '$lib/ndk/article-card'",
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
				importPath: "import { ArticleCardPortrait } from '$lib/ndk/blocks'",
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
				importPath: "import { ArticleCardHero } from '$lib/ndk/blocks'",
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
				importPath: "import { ArticleCardNeon } from '$lib/ndk/blocks'",
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
				importPath: "import { ArticleCardMedium } from '$lib/ndk/blocks'",
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
