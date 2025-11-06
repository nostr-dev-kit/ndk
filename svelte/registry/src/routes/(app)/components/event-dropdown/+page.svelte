<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import { eventDropdownMetadata, eventDropdownCard } from '$lib/component-registry/event-dropdown';
	import { EditProps } from '$lib/site-components/edit-props';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import type { ShowcaseBlock } from '$lib/templates/types';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import SectionTitle from '$site-components/SectionTitle.svelte';
	import { EventCard } from '$lib/registry/components/event-card';
	import EventDropdown from '$lib/registry/components/event-card/event-dropdown.svelte';

	// Import code example
	import eventDropdownCode from './event-dropdown.example?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let sampleEvent = $state<NDKEvent | undefined>();
	let showRelayInfo = $state(true);

	// Showcase blocks
	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Standalone',
			description: 'EventDropdown as standalone component',
			command: 'npx jsrepo add event-dropdown',
			preview: standalonePreview,
			cardData: eventDropdownCard,
			control: relayInfoControl
		}
	];
</script>

<!-- Preview snippets for showcase -->
{#snippet standalonePreview()}
	{#if sampleEvent}
		<div class="flex items-center justify-center p-8">
			<EventDropdown {ndk} event={sampleEvent} {showRelayInfo} />
		</div>
	{/if}
{/snippet}

{#snippet relayInfoControl()}
	<div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {showRelayInfo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showRelayInfo = true}
		>
			With Relay Info
		</button>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {!showRelayInfo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showRelayInfo = false}
		>
			Without Relay Info
		</button>
	</div>
{/snippet}

<!-- Custom sections for usage examples -->
{#snippet customSections()}
	<section class="mt-16 mb-8">
		<h2 class="text-3xl font-bold mb-4">Usage Examples</h2>

		<div class="space-y-6">
			<div class="bg-muted/50 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-3">Standalone Dropdown</h3>
				<pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import EventDropdown from '$lib/registry/components/event-card/event-dropdown.svelte';
&lt;/script&gt;

&lt;EventDropdown &#123;ndk&#125; &#123;event&#125; /&gt;</code></pre>
			</div>

			<div class="bg-muted/50 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-3">In Event Card Header</h3>
				<pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import &#123; EventCard &#125; from '$lib/registry/components/event-card';
  import EventDropdown from '$lib/registry/components/event-card/event-dropdown.svelte';
&lt;/script&gt;

&lt;EventCard.Root &#123;ndk&#125; &#123;event&#125;&gt;
  &lt;div class="flex items-start justify-between gap-2"&gt;
    &lt;EventCard.Header /&gt;
    &lt;EventDropdown &#123;ndk&#125; &#123;event&#125; /&gt;
  &lt;/div&gt;
  &lt;EventCard.Content /&gt;
&lt;/EventCard.Root&gt;</code></pre>
			</div>

			<div class="bg-muted/50 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-3">Without Relay Information</h3>
				<pre class="text-sm overflow-x-auto"><code>&lt;EventDropdown &#123;ndk&#125; &#123;event&#125; showRelayInfo=&#123;false&#125; /&gt;</code></pre>
			</div>

			<div class="bg-muted/50 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-3">Features</h3>
				<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
					<li><strong>Mute/Unmute:</strong> Toggle mute status for event author</li>
					<li><strong>Report:</strong> Report event for moderation (placeholder action)</li>
					<li><strong>Copy Author:</strong> Copy author's nprofile to clipboard</li>
					<li><strong>Copy Event ID:</strong> Copy event's nevent to clipboard</li>
					<li><strong>View Raw Event:</strong> Opens modal displaying raw JSON event data</li>
					<li><strong>Relay Info:</strong> Optional display of relay information where event was seen</li>
				</ul>
			</div>
		</div>
	</section>
{/snippet}

<!-- Conditional rendering based on data loading -->
{#if sampleEvent}
	<ComponentPageTemplate
		metadata={eventDropdownMetadata}
		{ndk}
		showcaseComponent={ComponentsShowcase}
		{showcaseBlocks}
		{customSections}
	>
		<EditProps.Prop
			name="Sample Event"
			type="event"
			bind:value={sampleEvent}
			default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
		/>
	</ComponentPageTemplate>
{:else}
	<div class="px-8">
		<PageTitle title={eventDropdownMetadata.title} subtitle={eventDropdownMetadata.description}>
			<EditProps.Prop
				name="Sample Event"
				type="event"
				bind:value={sampleEvent}
				default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
			/>
		</PageTitle>
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading sample event...</div>
		</div>
	</div>
{/if}
