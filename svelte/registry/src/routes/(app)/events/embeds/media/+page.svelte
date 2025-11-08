<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Preview from '$site-components/preview.svelte';
	import ApiTable from '$site-components/api-table.svelte';

	import CustomRendererCarousel from '../../../ui/event-rendering/examples/custom-renderer-carousel/index.svelte';
	import CustomRendererCarouselRaw from '../../../ui/event-rendering/examples/custom-renderer-carousel/index.txt?raw';
	import CustomRendererBento from '../../../ui/event-rendering/examples/custom-renderer-bento/index.svelte';
	import CustomRendererBentoRaw from '../../../ui/event-rendering/examples/custom-renderer-bento/index.txt?raw';

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
	<title>Media Components - NDK Svelte</title>
	<meta
		name="description"
		content="Custom media renderers for elegant carousels and bento grids displaying grouped images and videos."
	/>
</svelte:head>

<div class="component-page">
	<header>
		<div class="header-badge">
			<span class="badge">Custom Renderer</span>
		</div>
		<div class="header-title">
			<h1>Media Components</h1>
		</div>
		<p class="header-description">
			Custom media renderer components that receive grouped media URLs and display them in elegant
			layouts. When images or videos are separated only by whitespace in event content, they're
			automatically grouped and passed to your custom mediaComponent as an array.
		</p>
		<div class="header-info">
			<div class="info-card">
				<strong>Auto Grouping</strong>
				<span>Media separated by whitespace groups automatically</span>
			</div>
			<div class="info-card">
				<strong>Array Support</strong>
				<span>Receives url: string | string[]</span>
			</div>
			<div class="info-card">
				<strong>Multiple Layouts</strong>
				<span>Carousel, bento grid, or custom</span>
			</div>
		</div>
	</header>

	<section class="demo space-y-8">
		<h2>Examples</h2>

		<Preview
			title="Carousel Media Renderer"
			code={CustomRendererCarouselRaw}
		>
			<CustomRendererCarousel />
		</Preview>

		<Preview
			title="Bento Grid Media Renderer"
			code={CustomRendererBentoRaw}
		>
			<CustomRendererBento />
		</Preview>
	</section>

	<section class="info">
		<h2>How Media Grouping Works</h2>
		<p class="mb-4">
			The EventContent component automatically groups consecutive images and videos that are
			separated only by whitespace (spaces, newlines, etc.). Any other content breaks the grouping.
		</p>
		<pre><code>// Example content that creates a grouped media component:
"Check out these photos!

https://example.com/1.jpg
https://example.com/2.jpg

https://example.com/3.jpg

All from the same trip!"

// Result: mediaComponent receives url: [url1, url2, url3]</code></pre>
	</section>

	<section class="info">
		<h2>MediaComponent Interface</h2>
		<p class="mb-4">
			Your custom media component receives either a single URL string or an array of URLs for
			grouped media:
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
					name: 'type',
					type: 'string',
					default: 'optional',
					description: 'Media type hint (image, video, youtube)'
				},
				{
					name: 'class',
					type: 'string',
					default: "''",
					description: 'Additional CSS classes'
				}
			]}
		/>
		<pre><code>interface Props &#123;
  url: string | string[];
  type?: string;
  class?: string;
&#125;

// Normalize to array for processing:
const urls = Array.isArray(url) ? url : [url];</code></pre>
	</section>

	<section class="info">
		<h2>Usage</h2>
		<p class="mb-4">Set your custom media component in the ContentRenderer:</p>
		<pre><code>import &#123; ContentRenderer, EventContent &#125; from '$lib/registry/ui/embedded-event.svelte';
import MediaCarousel from './media-carousel.svelte';

const renderer = new ContentRenderer();
renderer.mediaComponent = MediaCarousel;

&lt;EventContent &#123;ndk&#125; &#123;event&#125; &#123;renderer&#125; /&gt;</code></pre>
	</section>

	<section class="info">
		<h2>Supported Media Types</h2>
		<p class="mb-4">The media grouping system automatically detects:</p>
		<ul class="ml-6 mb-4 space-y-2">
			<li><strong>Images:</strong> .jpg, .jpeg, .png, .gif, .webp, .svg</li>
			<li><strong>Videos:</strong> .mp4, .webm, .mov</li>
			<li><strong>YouTube:</strong> youtube.com/watch?v=, youtu.be/, youtube.com/embed/</li>
		</ul>
		<p class="mb-4">
			Note: Currently only images are grouped. Videos and YouTube embeds are shown individually even
			if consecutive.
		</p>
	</section>

	<section class="info">
		<h2>Creating Custom Media Components</h2>
		<p class="mb-4">Key considerations when building custom media renderers:</p>
		<div class="tips-grid">
			<div class="tip-card">
				<strong>Handle Both Cases</strong>
				<p>
					Always normalize <code>url</code> to an array, even if you receive a single string. This
					ensures consistent behavior.
				</p>
			</div>
			<div class="tip-card">
				<strong>Support All Media Types</strong>
				<p>
					Check if URLs are images, videos, or YouTube embeds and render appropriately for each
					type.
				</p>
			</div>
			<div class="tip-card">
				<strong>Optimize Performance</strong>
				<p>Use lazy loading for images, efficient transitions, and consider viewport-based loading.</p>
			</div>
			<div class="tip-card">
				<strong>Accessibility</strong>
				<p>Add keyboard navigation, ARIA labels, and ensure screen reader compatibility.</p>
			</div>
		</div>
	</section>

	<section class="info">
		<h2>Related</h2>
		<div class="related-grid">
			<a href="/ui/event-rendering" class="related-card">
				<strong>Event Content Primitive</strong>
				<span>Core content parsing and rendering system</span>
			</a>
			<a href="/events/embeds" class="related-card">
				<strong>ContentRenderer System</strong>
				<span>Learn about the renderer architecture</span>
			</a>
			<a href="/events/embeds/links" class="related-card">
				<strong>Link Components</strong>
				<span>Custom link preview renderers</span>
			</a>
		</div>
	</section>
</div>

<style>
	.component-page {
		max-width: 900px;
	}

	header {
		margin-bottom: 3rem;
	}

	.header-badge {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		background: var(--muted);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.header-title h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
		background: linear-gradient(
			135deg,
			var(--primary) 0%,
			color-mix(in srgb, var(--primary) 70%, transparent) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.header-description {
		font-size: 1.125rem;
		line-height: 1.7;
		color: var(--muted-foreground);
		margin: 1rem 0 1.5rem 0;
	}

	.header-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}

	.info-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
	}

	.info-card strong {
		font-weight: 600;
		color: var(--foreground);
	}

	.info-card span {
		font-size: 0.875rem;
		color: var(--muted-foreground);
	}

	section {
		margin-bottom: 3rem;
	}

	section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	pre {
		margin: 1rem 0;
		padding: 1rem;
		background: var(--muted);
		border-radius: 0.5rem;
		overflow-x: auto;
	}

	pre code {
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	ul {
		list-style: disc;
	}

	ul li {
		color: var(--muted-foreground);
		line-height: 1.6;
	}

	.tips-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.tip-card {
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--background);
	}

	.tip-card strong {
		display: block;
		font-weight: 600;
		color: var(--primary);
		margin-bottom: 0.5rem;
	}

	.tip-card p {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0;
		line-height: 1.5;
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.related-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.2s;
	}

	.related-card:hover {
		border-color: var(--primary);
		transform: translateY(-2px);
	}

	.related-card strong {
		font-weight: 600;
		color: var(--foreground);
	}

	.related-card span {
		font-size: 0.875rem;
		color: var(--muted-foreground);
	}
</style>
