<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import ComponentCard from '$lib/site/components/ComponentCard.svelte';

	// Import component
	import { UnpublishedEventsButtonPopover } from '$lib/registry/components/unpublished-events-button-popover';

	// Import registry metadata
	import unpublishedEventsButtonPopoverMetadata from '$lib/registry/components/unpublished-events-button-popover/metadata.json';
	import unpublishedEventsBuilderMetadata from '$lib/registry/builders/unpublished-events/metadata.json';

	// Import example code (for display)
	import BasicCode from './examples/basic-usage/index.txt?raw';
	import WithEventCardCode from './examples/with-event-card/index.txt?raw';
	import BuilderOnlyCode from './examples/builder-only/index.txt?raw';
	import PrimitivesCustomCode from './examples/primitives-custom/index.txt?raw';

	// Import example components (for rendering)
	import BasicExample from './examples/basic-usage/index.svelte';
	import WithEventCardExample from './examples/with-event-card/index.svelte';
	import BuilderOnlyExample from './examples/builder-only/index.svelte';
	import PrimitivesCustomExample from './examples/primitives-custom/index.svelte';

	const metadata = {
		title: 'Unpublished Events',
		description: 'Track and retry events that failed to publish to Nostr relays',
		showcaseTitle: 'Unpublished Events Management',
		showcaseDescription: 'Components for managing events that failed to publish, with retry and discard actions'
	};

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
	<BasicExample {ndk} />
{/snippet}

<!-- Components section -->
{#snippet components()}
	<ComponentCard data={{ ...unpublishedEventsButtonPopoverMetadata, code: BasicCode }}>
		{#snippet preview()}
			{@render basicPreview()}
		{/snippet}
	</ComponentCard>
{/snippet}

<!-- Primitives section (includes both builder and UI primitives) -->
{#snippet primitives()}
	<!-- Builder Pattern Section -->
	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">Builder Pattern</h2>
		<p class="text-muted-foreground mb-6">
			Use the <code class="px-2 py-1 bg-muted rounded text-sm">createUnpublishedEvents()</code>
			builder for managing unpublished event state with reactive updates.
		</p>
		<div class="border border-border rounded-lg overflow-hidden">
			<div class="p-6 bg-card">
				<BuilderOnlyExample {ndk} />
			</div>
		</div>
	</section>

	<!-- UI Primitives Section -->
	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">UI Primitives</h2>
		<p class="text-muted-foreground mb-6">
			Compose custom layouts using UI primitives for maximum flexibility.
			The primitives follow a compound component pattern with Root, Badge, List, and Item components.
		</p>
		<div class="border border-border rounded-lg overflow-hidden">
			<div class="p-6 bg-card">
				<PrimitivesCustomExample {ndk} />
			</div>
		</div>
	</section>
{/snippet}

<ComponentPageTemplate
	{metadata}
	{ndk}
	showcaseComponents={[
		{
			id: 'unpublished-events-button-popover',
			cardData: unpublishedEventsButtonPopoverMetadata,
			preview: basicPreview,
			orientation: 'horizontal'
		}
	]}
	componentsSection={{
		title: 'Components',
		description: 'Ready-to-use components for managing unpublished events',
		cards: [
			{ ...unpublishedEventsButtonPopoverMetadata, code: BasicCode }
		],
		previews: {
			'unpublished-events-button-popover': basicPreview
		}
	}}
	buildersSection={{
		builders: [unpublishedEventsBuilderMetadata]
	}}
	{primitives}
/>
