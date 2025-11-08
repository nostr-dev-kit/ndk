<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Demo from '$site-components/Demo.svelte';
	import ApiTable from '$site-components/api-table.svelte';

	import CustomRendererLinkPreview from '../../../ui/event-rendering/examples/custom-renderer-link-preview.example.svelte';
	import CustomRendererLinkPreviewRaw from '../../../ui/event-rendering/examples/custom-renderer-link-preview.example.svelte?raw';
	import CustomRendererLinkEmbed from '../../../ui/event-rendering/examples/custom-renderer-link-embed.example.svelte';
	import CustomRendererLinkEmbedRaw from '../../../ui/event-rendering/examples/custom-renderer-link-embed.example.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
	<title>Link Components - NDK Svelte</title>
	<meta
		name="description"
		content="Rich link preview components with hover previews and embedded OpenGraph cards for URLs."
	/>
</svelte:head>

<div class="component-page">
	<header>
		<div class="header-badge">
			<span class="badge">Custom Renderer</span>
		</div>
		<div class="header-title">
			<h1>Link Components</h1>
		</div>
		<p class="header-description">
			Custom link renderer components that receive grouped URLs and display them with rich previews.
			When links are separated only by whitespace in event content, they're automatically grouped
			and passed to your custom linkComponent as an array.
		</p>
		<div class="header-info">
			<div class="info-card">
				<strong>Auto Grouping</strong>
				<span>Links separated by whitespace group automatically</span>
			</div>
			<div class="info-card">
				<strong>Array Support</strong>
				<span>Receives url: string | string[]</span>
			</div>
			<div class="info-card">
				<strong>Rich Previews</strong>
				<span>OpenGraph metadata with hover or inline display</span>
			</div>
		</div>
	</header>

	<section class="demo space-y-8">
		<h2>Examples</h2>

		<Demo
			title="Link Preview (Hover)"
			description="Show rich link previews on hover using bits-ui LinkPreview. Fetches OpenGraph metadata client-side and displays in an elegant popover. Perfect for inline links that don't need to dominate the content."
			code={CustomRendererLinkPreviewRaw}
		>
			<CustomRendererLinkPreview />
		</Demo>

		<Demo
			title="Embedded Link Preview"
			description="Auto-fetch and display rich link previews inline with OpenGraph metadata. Shows full preview cards with images, titles, descriptions, and favicons. Great for highlighting important links or creating link collections."
			code={CustomRendererLinkEmbedRaw}
		>
			<CustomRendererLinkEmbed />
		</Demo>
	</section>

	<section class="info">
		<h2>How Link Grouping Works</h2>
		<p class="mb-4">
			The EventContent component automatically groups consecutive links that are separated only by
			whitespace (spaces, newlines, etc.). Any other content breaks the grouping.
		</p>
		<pre><code>// Example content that creates a grouped link component:
"Check out these resources:

https://github.com/nostr-protocol/nips
https://nostr.com

https://njump.me

Great Nostr resources!"

// Result: linkComponent receives url: [url1, url2, url3]</code></pre>
	</section>

	<section class="info">
		<h2>LinkComponent Interface</h2>
		<p class="mb-4">
			Your custom link component receives either a single URL string or an array of URLs for grouped
			links:
		</p>
		<ApiTable
			rows={[
				{
					name: 'url',
					type: 'string | string[]',
					default: '',
					description: 'Single URL or array of URLs for grouped links'
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
  class?: string;
&#125;

// Normalize to array for processing:
const urls = Array.isArray(url) ? url : [url];</code></pre>
	</section>

	<section class="info">
		<h2>Usage</h2>
		<p class="mb-4">Set your custom link component in the ContentRenderer:</p>
		<pre><code>import &#123; ContentRenderer, EventContent &#125; from '$lib/registry/ui/embedded-event.svelte';
import LinkPreview from './link-preview.svelte';

const renderer = new ContentRenderer();
renderer.linkComponent = LinkPreview;

&lt;EventContent &#123;ndk&#125; &#123;event&#125; &#123;renderer&#125; /&gt;</code></pre>
	</section>

	<section class="info">
		<h2>OpenGraph Metadata Fetching</h2>
		<p class="mb-4">Both example components demonstrate client-side OpenGraph fetching:</p>
		<div class="tips-grid">
			<div class="tip-card">
				<strong>CORS Limitations</strong>
				<p>
					Most websites block cross-origin requests. The examples include fallback handling that
					shows domain info when full metadata can't be fetched.
				</p>
			</div>
			<div class="tip-card">
				<strong>Caching Strategy</strong>
				<p>
					The examples cache fetched metadata in a Map to avoid redundant requests for the same
					URL. Consider persisting to localStorage for better UX.
				</p>
			</div>
			<div class="tip-card">
				<strong>Loading States</strong>
				<p>
					Both components show loading indicators while fetching. The hover version delays fetching
					until hover to reduce unnecessary requests.
				</p>
			</div>
			<div class="tip-card">
				<strong>Server-Side Alternative</strong>
				<p>
					For production apps, consider a server-side proxy endpoint that fetches OpenGraph data
					without CORS restrictions.
				</p>
			</div>
		</div>
	</section>

	<section class="info">
		<h2>Creating Custom Link Components</h2>
		<p class="mb-4">Key considerations when building custom link renderers:</p>
		<div class="tips-grid">
			<div class="tip-card">
				<strong>Handle Both Cases</strong>
				<p>
					Always normalize <code>url</code> to an array, even if you receive a single string. This
					ensures consistent behavior.
				</p>
			</div>
			<div class="tip-card">
				<strong>Extract Domain</strong>
				<p>
					Use <code>new URL(url).hostname</code> to safely extract domains for display and favicon
					URLs.
				</p>
			</div>
			<div class="tip-card">
				<strong>OpenGraph Tags</strong>
				<p>
					Look for og:title, og:description, og:image, and twitter:* variants. Parse HTML using
					DOMParser.
				</p>
			</div>
			<div class="tip-card">
				<strong>Error Handling</strong>
				<p>Always provide fallback UI when fetching fails. Show at minimum the domain and URL.</p>
			</div>
		</div>
	</section>

	<section class="info">
		<h2>Bits-UI Integration</h2>
		<p class="mb-4">
			The hover preview example uses <a
				href="https://bits-ui.com/docs/components/link-preview"
				target="_blank"
				rel="noopener noreferrer">bits-ui LinkPreview</a
			> component for accessible, customizable popovers:
		</p>
		<pre><code>import &#123; LinkPreview &#125; from 'bits-ui';

&lt;LinkPreview.Root openDelay=&#123;200&#125; closeDelay=&#123;100&#125;&gt;
  &lt;LinkPreview.Trigger href=&#123;url&#125;&gt;
    &#123;url&#125;
  &lt;/LinkPreview.Trigger&gt;

  &lt;LinkPreview.Content&gt;
    &lt;!-- Preview card content --&gt;
  &lt;/LinkPreview.Content&gt;
&lt;/LinkPreview.Root&gt;</code></pre>
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
			<a href="/events/embeds/media" class="related-card">
				<strong>Media Components</strong>
				<span>Custom media carousel and bento grid renderers</span>
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

	a {
		color: var(--primary);
		text-decoration: underline;
	}
</style>
