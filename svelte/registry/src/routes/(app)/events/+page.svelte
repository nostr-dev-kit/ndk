<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import InteractiveDemo from './interactive-demo.svelte';
	import LayerVisualization from './layer-visualization.svelte';	import { EditProps } from '$lib/site-components/edit-props';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

	const ndk = getContext<NDKSvelte>('ndk');

	let sampleEvent = $state<NDKEvent | undefined>();
</script>

<div class="px-8 flex flex-col gap-8">
	<!-- Header -->
	<PageTitle title={metadata.title} subtitle={metadata.description}>
		<EditProps.Prop
			name="Sample Event"
			type="event"
			default="nevent1qvzqqqqqqypzq0mgmm0gz4yuczzyltl99rc4wj63uz27wjglg69aj6ylsamehwqaqqst6h0tdve9v0xwwpz4d4ckwfc9ksjtjjjutc4smjzewp85u7a9v0qhd8czh"
			bind:value={sampleEvent}
		/>
	</PageTitle>

	<!-- Introduction -->
	<section class="prose prose-lg max-w-none mb-12">
		<h2 class="text-3xl font-bold mb-4">The Three-Layer Architecture</h2>
		<p class="text-muted-foreground mb-6">
			Nostr events render through three composable layers. Each layer has a specific responsibility
			and can be used independently or combined together. This separation allows for maximum
			flexibility and reusability.
		</p>

		<LayerVisualization />
	</section>

	<!-- Interactive Demo -->
	{#if sampleEvent}
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Interactive Demonstration</h2>
			<p class="text-muted-foreground mb-8">
				Click on any layer to explore how different variants change the rendering. Notice how the
				<span class="text-blue-500 font-semibold">chrome (blue)</span>,
				<span class="text-purple-500 font-semibold">content (purple)</span>, and
				<span class="text-orange-500 font-semibold">embeds (orange)</span>
				are independently swappable.
			</p>

			<InteractiveDemo {ndk} event={sampleEvent} />
		</section>
	{:else}
		<section class="mb-16">
			<div class="flex items-center justify-center py-12 border border-border rounded-lg bg-muted/50">
				<div class="text-muted-foreground">Loading event...</div>
			</div>
		</section>
	{/if}

	<!-- Usage Patterns -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-4">Common Usage Patterns</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="p-6 border border-border rounded-lg bg-card">
				<h3 class="text-lg font-semibold mb-3">Full Event Card</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Combine all three layers for a complete social post display in feeds.
				</p>
				<pre
					class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>&lt;EventCard.Root&gt;
  &lt;EventCard.Header /&gt;
  &lt;EventCard.Content /&gt;
  &lt;EventCard.Actions /&gt;
&lt;/EventCard.Root&gt;</code></pre>
			</div>

			<div class="p-6 border border-border rounded-lg bg-card">
				<h3 class="text-lg font-semibold mb-3">Content Only</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Render just the event body without chrome for focused reading experiences.
				</p>
				<pre class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>&lt;EventContent
  event=&#123;event&#125;
  ndk=&#123;ndk&#125;
/&gt;</code></pre>
			</div>

			<div class="p-6 border border-border rounded-lg bg-card">
				<h3 class="text-lg font-semibold mb-3">Thread View</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Use the Thread chrome variant for optimized conversation layouts.
				</p>
				<pre
					class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>&lt;EventCard.Root variant="threaded"&gt;
  &lt;EventCard.Header /&gt;
  &lt;EventCard.Content /&gt;
  &lt;EventCard.Actions /&gt;
&lt;/EventCard.Root&gt;</code></pre>
			</div>

			<div class="p-6 border border-border rounded-lg bg-card">
				<h3 class="text-lg font-semibold mb-3">Custom Composition</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Mix chrome with custom content for specialized layouts.
				</p>
				<pre
					class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>&lt;EventCard.Root&gt;
  &lt;EventCard.Header /&gt;
  &lt;CustomContentComponent /&gt;
  &lt;EventCard.Actions /&gt;
&lt;/EventCard.Root&gt;</code></pre>
			</div>
		</div>
	</section>

	<!-- Learn More -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-4">Learn More</h2>
		<p class="text-muted-foreground mb-6">Dive deeper into each layer:</p>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<a
				href="/events/cards"
				class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
			>
				<div class="flex items-start justify-between mb-3">
					<h3 class="text-lg font-semibold">Cards (Chrome)</h3>
					<span class="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-semibold"
						>Layer 1</span
					>
				</div>
				<p class="text-sm text-muted-foreground mb-4">
					EventCard primitives and specialized card components for different event kinds.
				</p>
				<div class="text-sm text-primary group-hover:underline">View Cards Documentation →</div>
			</a>

			<a
				href="/events/content/note"
				class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
			>
				<div class="flex items-start justify-between mb-3">
					<h3 class="text-lg font-semibold">Content Renderers</h3>
					<span class="text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded font-semibold"
						>Layer 2</span
					>
				</div>
				<p class="text-sm text-muted-foreground mb-4">
					Kind-specific content renderers for notes, articles, images, and more.
				</p>
				<div class="text-sm text-primary group-hover:underline">View Content Components →</div>
			</a>

			<a
				href="/events/embeds"
				class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
			>
				<div class="flex items-start justify-between mb-3">
					<h3 class="text-lg font-semibold">Embedded Previews</h3>
					<span class="text-xs px-2 py-1 bg-orange-500/10 text-orange-500 rounded font-semibold"
						>Layer 3</span
					>
				</div>
				<p class="text-sm text-muted-foreground mb-4">
					ContentRenderer system and embedded event handlers for rich previews.
				</p>
				<div class="text-sm text-primary group-hover:underline">View Embeds Documentation →</div>
			</a>
		</div>
	</section>

	<!-- Design Philosophy -->
	<section class="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-16">
		<h3 class="text-lg font-semibold mb-2">💡 Design Philosophy</h3>
		<p class="text-muted-foreground">
			The three-layer architecture provides maximum flexibility. Use the full stack (Chrome +
			Content + Embeds) for rich social feeds, or use layers independently for specialized views.
			Each layer is swappable and composable, allowing you to build exactly the UI you need without
			fighting the framework.
		</p>
	</section>
</div>

<style>
	code {
		background: hsl(var(--muted));
		padding: 0.2em 0.4em;
		border-radius: 0.25rem;
		font-size: 0.9em;
	}
</style>
