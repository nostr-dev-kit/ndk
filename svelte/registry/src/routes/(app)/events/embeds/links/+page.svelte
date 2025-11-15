<script lang="ts">
		import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import Preview from '$lib/site/components/preview.svelte';

	import LinkInlineBasic from '$lib/registry/components/link-inline-basic/link-inline-basic.svelte';
	import linkInlineBasicMetadata from '$lib/registry/components/link-inline-basic/metadata.json';

	import LinkEmbed from '$lib/registry/components/link-embed/link-embed.svelte';
	import linkEmbedMetadata from '$lib/registry/components/link-embed/metadata.json';

	import { LinkIcon } from '$lib/registry/ui/icons';

	// Import example code (for display)
	import linkInlineBasicCode from './examples/link-inline-basic/index.txt?raw';
	import linkEmbedCode from './examples/link-embed/index.txt?raw';
	import customLinkHandlerCode from './examples/custom-handler/index.txt?raw';

	// Import example components (for rendering)
	import CustomLinkHandler from './examples/custom-handler/index.svelte';
	const metadata = {
		title: 'Link Components',
		description: 'Link renderer components that auto-register with ContentRenderer to handle URLs in event content'
	};

	const sampleUrls = [
		'https://github.com/nostr-protocol/nips',
		'https://nostr.how'
	];

	const componentsSection = {
		cards: [
			{ ...linkInlineBasicMetadata, code: linkInlineBasicCode },
			{ ...linkEmbedMetadata, code: linkEmbedCode }
		],
		previews: {
			'link-inline-basic': linkInlineBasicSnippet,
			'link-embed': linkEmbedSnippet
		}
	};
</script>

{#snippet linkInlineBasicSnippet()}
	<LinkInlineBasic url={sampleUrls} />
{/snippet}

{#snippet linkEmbedSnippet()}
	<LinkEmbed url={sampleUrls} />
{/snippet}

{#snippet primitives()}
	<section class="mt-16 space-y-8">
		<div>
			<h2 class="text-3xl font-bold mb-4">Auto-Registration System</h2>
			<p class="text-muted-foreground mb-6">
				Link components automatically register with ContentRenderer when imported via side-effect imports. The ContentRenderer uses a priority system to determine which handler to use.
			</p>

			<div class="border border-border rounded-lg p-6 bg-muted/50 space-y-4">
				<h3 class="text-lg font-semibold">How Auto-Registration Works</h3>
				<p class="text-sm text-muted-foreground">
					When you import a link component, it automatically calls <code class="px-2 py-1 bg-background rounded text-xs">defaultContentRenderer.setLinkComponent()</code> with a priority number. Higher priority components override lower priority ones.
				</p>
				<pre class="bg-background border border-border rounded-md p-4 overflow-x-auto"><code class="text-sm">{`// Priority system:
// - link-inline-basic: priority 1 (basic inline links)
// - link-embed: priority 5 (rich embedded previews)

// Just import to register:
import '$lib/registry/components/link-inline-basic';

// Or for rich previews:
import '$lib/registry/components/link-embed';`}</code></pre>
			</div>
		</div>

		<div>
			<h2 class="text-3xl font-bold mb-4">Link Grouping</h2>
			<p class="text-muted-foreground mb-6">
				The EventContent component automatically groups consecutive links that are separated only by whitespace. Grouped links are passed to the link component as an array.
			</p>

			<div class="border border-border rounded-lg p-6 bg-muted/50 space-y-4">
				<h3 class="text-lg font-semibold">Grouping Behavior</h3>
				<pre class="bg-background border border-border rounded-md p-4 overflow-x-auto"><code class="text-sm">{`// This event content:
"Check out these resources:

https://github.com/nostr-protocol/nips
https://nostr.com
https://njump.me

Great Nostr resources!"

// Results in:
// linkComponent receives: url: [url1, url2, url3]`}</code></pre>
			</div>
		</div>

		<div>
			<h2 class="text-3xl font-bold mb-4">Component Props</h2>
			<p class="text-muted-foreground mb-6">
				Both link components accept the same props interface, making them interchangeable.
			</p>

			<div class="border border-border rounded-lg p-6 bg-muted/50 space-y-4">
				<pre class="bg-background border border-border rounded-md p-4 overflow-x-auto"><code class="text-sm">{`interface Props {
  url: string | string[];  // Single URL or grouped array
  class?: string;          // Additional CSS classes
}`}</code></pre>

				<div class="mt-4">
					<h4 class="font-semibold mb-3">Props</h4>
					<div class="space-y-3">
						<div class="flex flex-col gap-1">
							<div class="flex items-baseline gap-2">
								<code class="text-sm font-mono bg-background px-2 py-1 rounded">url</code>
								<span class="text-sm text-muted-foreground">string | string[]</span>
								<span class="text-xs text-muted-foreground ml-auto">required</span>
							</div>
							<p class="text-sm text-muted-foreground">Single URL or array of URLs for grouped links</p>
						</div>
						<div class="flex flex-col gap-1">
							<div class="flex items-baseline gap-2">
								<code class="text-sm font-mono bg-background px-2 py-1 rounded">class</code>
								<span class="text-sm text-muted-foreground">string</span>
								<span class="text-xs text-muted-foreground ml-auto">optional</span>
							</div>
							<p class="text-sm text-muted-foreground">Additional CSS classes</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div>
			<h2 class="text-3xl font-bold mb-4">Related Components</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a href="/ui/event-rendering" class="border border-border rounded-lg p-4 hover:border-primary transition-all hover:-translate-y-1 no-underline">
					<h4 class="font-semibold text-foreground mb-2">Event Content</h4>
					<p class="text-sm text-muted-foreground">Core content parsing and rendering system</p>
				</a>
				<a href="/events/embeds" class="border border-border rounded-lg p-4 hover:border-primary transition-all hover:-translate-y-1 no-underline">
					<h4 class="font-semibold text-foreground mb-2">ContentRenderer</h4>
					<p class="text-sm text-muted-foreground">Renderer architecture and priority system</p>
				</a>
				<a href="/events/embeds/media" class="border border-border rounded-lg p-4 hover:border-primary transition-all hover:-translate-y-1 no-underline">
					<h4 class="font-semibold text-foreground mb-2">Media Components</h4>
					<p class="text-sm text-muted-foreground">Custom media renderers for images and videos</p>
				</a>
			</div>
		</div>
	</section>
{/snippet}

{#snippet customLinkHandlerPreview()}
	<CustomLinkHandler url={sampleUrls} />
{/snippet}

{#snippet recipes()}
	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">Custom Link Handler</h2>
		<p class="text-muted-foreground mb-6">
			Create a custom link handler by implementing the same interface and registering with a higher priority to override the default handlers.
		</p>

		<Preview code={customLinkHandlerCode}>
			{@render customLinkHandlerPreview()}
		</Preview>
	</section>
{/snippet}

<ComponentPageTemplate
	{metadata}
	{ndk}
	showcaseComponents={[
		{
			id: 'link-inline-basic',
			cardData: linkInlineBasicMetadata,
			preview: linkInlineBasicSnippet,
			orientation: 'horizontal'
		},
		{
			id: 'link-embed',
			cardData: linkEmbedMetadata,
			preview: linkEmbedSnippet,
			orientation: 'horizontal'
		}
	]}
	{componentsSection}
	{primitives}
	{recipes}
/>
