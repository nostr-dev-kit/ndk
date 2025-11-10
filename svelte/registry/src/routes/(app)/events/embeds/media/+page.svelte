<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import ComponentCard from '$lib/site/components/ComponentCard.svelte';
	import ApiTable from '$site-components/api-table.svelte';
	import { EditProps } from '$lib/site/components/edit-props';

	// Import MediaRender components and metadata
	import '$lib/registry/components/media-render'; // Auto-registers with ContentRenderer
	import mediaRenderMeta from '$lib/registry/components/media-render/metadata.json';
	import mediaRenderCarouselMeta from '$lib/registry/components/media-render-carousel/metadata.json';
	import mediaRenderBentoGridMeta from '$lib/registry/components/media-render-bento-grid/metadata.json';

	// Import examples
	import MediaRenderExample from './examples/basic/index.svelte';
	import MediaRenderCode from './examples/basic/index.txt?raw';
	import CarouselExample from './examples/carousel/index.svelte';
	import CarouselCode from './examples/carousel/index.txt?raw';
	import BentoExample from './examples/bento-grid/index.svelte';
	import BentoCode from './examples/bento-grid/index.txt?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let sampleEvent = $state<NDKEvent | undefined>();

	const metadata = {
		title: 'Media Components',
		description:
			'Smart media rendering with NSFW filtering, follows-based content control, and elegant layouts',
		showcaseTitle: 'MediaRender - Intelligent Media Filtering',
		showcaseDescription:
			'MediaRender provides automatic NSFW detection (NIP-36) and follows-based filtering, with multiple layout options for grouped media.'
	};

	// Component card data for primitives section
	const mediaRenderCardData = {
		...mediaRenderMeta,
		code: `import '$lib/registry/components/media-render';

// MediaRender auto-registers with ContentRenderer
// Now all EventContent components will use MediaRender for media

// Or use directly:
import MediaRender from '$lib/registry/components/media-render';

<MediaRender
  url={mediaUrls}
  event={nostrEvent}
/>`
	};

	// Components section configuration
	const componentsSection = {
		cards: [
			{...mediaRenderMeta, code: MediaRenderCode},
			{
				...mediaRenderCarouselMeta,
				code: CarouselCode,
				title: 'Media Render Carousel',
				richDescription: 'Carousel layout with NSFW and follows-based filtering'
			},
			{
				...mediaRenderBentoGridMeta,
				code: BentoCode,
				title: 'Media Render Bento Grid',
				richDescription: 'Bento grid layout with smart content filtering'
			}
		],
		previews: {
			'media-render': mediaRenderPreview,
			'media-render-carousel': carouselPreview,
			'media-render-bento-grid': bentoPreview
		}
	};
</script>

<svelte:head>
	<title>Media Components - NDK Svelte</title>
	<meta
		name="description"
		content="Smart media rendering with NSFW filtering, follows-based content control, and elegant layouts for Nostr events."
	/>
</svelte:head>

{#snippet mediaRenderPreview()}
	<MediaRenderExample {ndk} event={sampleEvent} />
{/snippet}

{#snippet carouselPreview()}
	<CarouselExample {ndk} event={sampleEvent} />
{/snippet}

{#snippet bentoPreview()}
	<BentoExample {ndk} event={sampleEvent} />
{/snippet}

{#snippet primitives()}
		<!-- MediaRender Component -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">MediaRender - Smart Media Filtering</h2>
			<p class="text-muted-foreground mb-4">
				MediaRender is the primary media component that automatically handles NSFW content and follows-based filtering.
				It integrates seamlessly with the ContentRenderer system. For different layouts, use MediaRenderCarousel or MediaRenderBentoGrid components.
			</p>
			<ComponentCard data={mediaRenderCardData}>
				{#snippet preview()}
					<MediaRenderExample />
				{/snippet}
			</ComponentCard>

			<div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="p-4 border border-border rounded-lg bg-background">
					<strong class="block font-semibold text-primary mb-2">NSFW Detection (NIP-36)</strong>
					<p class="text-sm text-muted-foreground leading-relaxed m-0">
						Automatically detects <code class="px-2 py-1 bg-muted rounded text-sm">["content-warning", "reason"]</code> tags
						and blurs media with click-to-reveal interface.
					</p>
				</div>
				<div class="p-4 border border-border rounded-lg bg-background">
					<strong class="block font-semibold text-primary mb-2">Follows-based Filtering</strong>
					<p class="text-sm text-muted-foreground leading-relaxed m-0">
						When logged in, blurs media from users you don't follow. Provides privacy and content control.
					</p>
				</div>
			</div>
		</section>

		<!-- How Media Grouping Works -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">How Media Grouping Works</h2>
			<p class="text-muted-foreground mb-4">
				The EventContent component automatically groups consecutive images and videos that are
				separated only by whitespace (spaces, newlines, etc.). Any other content breaks the grouping.
			</p>
			<div class="bg-muted rounded-lg p-4 overflow-x-auto">
				<pre class="text-sm font-mono leading-relaxed"><code>// Example content that creates a grouped media component:
"Check out these photos!

https://example.com/1.jpg
https://example.com/2.jpg

https://example.com/3.jpg

All from the same trip!"

// Result: mediaComponent receives url: [url1, url2, url3]</code></pre>
			</div>
		</section>

		<!-- MediaComponent Interface -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">MediaRender Component API</h2>
			<p class="text-muted-foreground mb-4">
				MediaRender accepts the following props for intelligent media filtering and display:
			</p>
			<ApiTable
				rows={[
					{
						name: 'url',
						type: 'string | string[]',
						default: '',
						description: 'Single media URL or array of URLs for grouped media'
					},
					{
						name: 'event',
						type: 'NDKEvent',
						default: 'undefined',
						description: 'Nostr event for checking author and content-warning tags'
					},
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					}
				]}
			/>
			<div class="bg-muted rounded-lg p-4 overflow-x-auto mt-4">
				<pre class="text-sm font-mono leading-relaxed"><code>interface Props &#123;
  url: string | string[];
  event?: NDKEvent;         // For NSFW and follows checking
  class?: string;
&#125;

// MediaRender handles filtering automatically:
// - Blurs NSFW content (NIP-36 content-warning tags)
// - Blurs content from unfollowed users when logged in
// - Provides click-to-reveal interface</code></pre>
			</div>
		</section>

		<!-- Usage -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">Usage</h2>
			<p class="text-muted-foreground mb-4">
				MediaRender auto-registers with ContentRenderer on import:
			</p>
			<div class="bg-muted rounded-lg p-4 overflow-x-auto">
				<pre class="text-sm font-mono leading-relaxed"><code>// Option 1: Auto-registration (recommended)
import '$lib/registry/components/media-render';
// Now all EventContent components use MediaRender automatically

// Option 2: Manual registration
import &#123; ContentRenderer &#125; from '$lib/registry/ui/content-renderer';
import MediaRender from '$lib/registry/components/media-render';

const renderer = new ContentRenderer();
renderer.mediaComponent = MediaRender;

// Option 3: Direct usage with different layouts
import MediaRender from '$lib/registry/components/media-render';
import MediaRenderCarousel from '$lib/registry/components/media-render-carousel';
import MediaRenderBentoGrid from '$lib/registry/components/media-render-bento-grid';

// Simple layout
&lt;MediaRender url=&#123;mediaUrls&#125; event=&#123;nostrEvent&#125; /&gt;

// Carousel layout with filtering
&lt;MediaRenderCarousel url=&#123;mediaUrls&#125; event=&#123;nostrEvent&#125; /&gt;

// Bento grid layout with filtering
&lt;MediaRenderBentoGrid url=&#123;mediaUrls&#125; event=&#123;nostrEvent&#125; /&gt;</code></pre>
			</div>

			<h3 class="text-xl font-semibold mt-6 mb-3">Global Configuration</h3>
			<div class="bg-muted rounded-lg p-4 overflow-x-auto">
				<pre class="text-sm font-mono leading-relaxed"><code>import &#123; defaultContentRenderer &#125; from '$lib/registry/ui/content-renderer';

// Control NSFW blocking globally
defaultContentRenderer.blockNsfw = false; // Disable NSFW filtering
defaultContentRenderer.blockNsfw = true;  // Re-enable (default)</code></pre>
			</div>
		</section>

		<!-- Supported Media Types -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">Supported Media Types</h2>
			<p class="text-muted-foreground mb-4">
				The media grouping system automatically detects:
			</p>
			<ul class="ml-6 mb-4 space-y-2 list-disc">
				<li class="text-muted-foreground leading-relaxed">
					<strong class="text-foreground">Images:</strong> .jpg, .jpeg, .png, .gif, .webp, .svg
				</li>
				<li class="text-muted-foreground leading-relaxed">
					<strong class="text-foreground">Videos:</strong> .mp4, .webm, .mov
				</li>
				<li class="text-muted-foreground leading-relaxed">
					<strong class="text-foreground">YouTube:</strong> youtube.com/watch?v=, youtu.be/, youtube.com/embed/
				</li>
			</ul>
			<p class="text-muted-foreground mb-4">
				Note: Currently only images are grouped. Videos and YouTube embeds are shown individually
				even if consecutive.
			</p>
		</section>

		<!-- Creating Custom Media Components -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">Creating Custom Media Components</h2>
			<p class="text-muted-foreground mb-4">
				Key considerations when building custom media renderers:
			</p>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
				<div class="p-4 border border-border rounded-lg bg-background">
					<strong class="block font-semibold text-primary mb-2">Handle Both Cases</strong>
					<p class="text-sm text-muted-foreground leading-relaxed m-0">
						Always normalize <code
							class="px-2 py-1 bg-muted rounded text-sm font-mono">url</code
						> to an array, even if you receive a single string. This ensures consistent behavior.
					</p>
				</div>
				<div class="p-4 border border-border rounded-lg bg-background">
					<strong class="block font-semibold text-primary mb-2">Support All Media Types</strong>
					<p class="text-sm text-muted-foreground leading-relaxed m-0">
						Check if URLs are images, videos, or YouTube embeds and render appropriately for each
						type.
					</p>
				</div>
				<div class="p-4 border border-border rounded-lg bg-background">
					<strong class="block font-semibold text-primary mb-2">Optimize Performance</strong>
					<p class="text-sm text-muted-foreground leading-relaxed m-0">
						Use lazy loading for images, efficient transitions, and consider viewport-based loading.
					</p>
				</div>
				<div class="p-4 border border-border rounded-lg bg-background">
					<strong class="block font-semibold text-primary mb-2">Accessibility</strong>
					<p class="text-sm text-muted-foreground leading-relaxed m-0">
						Add keyboard navigation, ARIA labels, and ensure screen reader compatibility.
					</p>
				</div>
			</div>
		</section>

		<!-- Related -->
		<section class="mt-16">
			<h2 class="text-3xl font-bold mb-4">Related</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<a
					href="/components/media-render"
					class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5"
				>
					<strong class="font-semibold text-foreground">MediaRender Docs</strong>
					<span class="text-sm text-muted-foreground"
						>Full documentation and examples</span
					>
				</a>
				<a
					href="/ui/event-rendering"
					class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5"
				>
					<strong class="font-semibold text-foreground">Event Content Primitive</strong>
					<span class="text-sm text-muted-foreground"
						>Core content parsing and rendering system</span
					>
				</a>
				<a
					href="/events/embeds"
					class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5"
				>
					<strong class="font-semibold text-foreground">ContentRenderer System</strong>
					<span class="text-sm text-muted-foreground">Learn about the renderer architecture</span>
				</a>
				<a
					href="/events/embeds/links"
					class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5"
				>
					<strong class="font-semibold text-foreground">Link Components</strong>
					<span class="text-sm text-muted-foreground">Custom link preview renderers</span>
				</a>
			</div>
		</section>
{/snippet}

<ComponentPageTemplate
	{metadata}
	{ndk}
	showcaseComponents={[
		{
			id: 'media-render',
			cardData: {
				...mediaRenderMeta,
				code: MediaRenderCode
			},
			orientation: 'vertical',
			preview: mediaRenderPreview
		},
		{
			id: 'carousel-media-renderer',
			cardData: {
				...mediaRenderCarouselMeta,
				code: CarouselCode
			},
			orientation: 'vertical',
			preview: carouselPreview
		},
		{
			id: 'bento-media-renderer',
			cardData: {
				...mediaRenderBentoGridMeta,
				code: BentoCode
			},
			orientation: 'vertical',
			preview: bentoPreview
		}
	]}
	{componentsSection}
	{primitives}
>
	<!-- Info cards in header -->
	{#snippet children()}
		<EditProps.Prop
			name="Sample Event"
			type="event"
			default="nevent1qvzqqqqqqypzqsfjd4hcwpfnsxze4ypn8p2vvgp3e5csyvmvv65lfdv3rpv8mgwnqqspkreuafmht7qfg4yrth0fucckm22c8q69s7q77caqdk84xletqvganhr3l"
			bind:value={sampleEvent}
		/>
	{/snippet}
</ComponentPageTemplate>
