<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { hashtagMetadata, hashtagCards, hashtagModernCard, hashtagBasicCard, hashtagCustomCard, hashtagInteractiveCard } from '$lib/component-registry/hashtag';
	import type { ShowcaseBlock } from '$lib/templates/types';

	import UIModern from './examples/ui-modern.example.svelte';
	import UIBasic from './examples/ui-basic.example.svelte';
	import UICustom from './examples/ui-custom.example.svelte';
	import UIInteractive from './examples/ui-interactive.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Modern',
			description: 'Rich hashtag with hover card',
			command: 'npx jsrepo add hashtag-modern',
			preview: modernPreview,
			cardData: hashtagModernCard
		},
		{
			name: 'Basic',
			description: 'Minimal hashtag',
			command: 'npx jsrepo add hashtag',
			preview: basicPreview,
			cardData: hashtagBasicCard
		},
		{
			name: 'Custom',
			description: 'Custom styled',
			command: 'npx jsrepo add hashtag',
			preview: customPreview,
			cardData: hashtagCustomCard
		},
		{
			name: 'Interactive',
			description: 'With click handler',
			command: 'npx jsrepo add hashtag',
			preview: interactivePreview,
			cardData: hashtagInteractiveCard
		}
	];
</script>

{#snippet modernPreview()}
	<div class="p-4 border rounded-lg">
		<p class="text-sm">
			Hover to see stats: <HashtagModern
				{ndk}
				tag="nostr"
			/> and <HashtagModern
				{ndk}
				tag="bitcoin"
			/>
		</p>
	</div>
{/snippet}

{#snippet basicPreview()}
	<UIBasic />
{/snippet}

{#snippet customPreview()}
	<UICustom />
{/snippet}

{#snippet interactivePreview()}
	<UIInteractive />
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'HashtagModern',
				description: 'Modern inline hashtag with stats card popover on hover',
				importPath: "import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'tag', type: 'string', required: true, description: 'Hashtag text (with or without # prefix)' },
					{ name: 'onclick', type: '(tag: string) => void', description: 'Optional click handler' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'Hashtag (UI Primitive)',
				description: 'Inline hashtag component with optional click handling',
				importPath: "import { Hashtag } from '$lib/registry/components/hashtag'",
				props: [
					{ name: 'tag', type: 'string', required: true, description: 'Hashtag text (without #)' },
					{ name: 'onclick', type: '(tag: string) => void', description: 'Optional click handler' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]}
	/>
{/snippet}

{#if true}
	{@const previews = {
		'hashtag-modern': modernPreview,
		'hashtag-basic': basicPreview,
		'hashtag-custom': customPreview,
		'hashtag-interactive': interactivePreview
	} as any}
	<ComponentPageTemplate
	metadata={hashtagMetadata}
	{ndk}
	{showcaseBlocks}
	componentsSection={{
		cards: hashtagCards,
		previews
	}}
	{customSections}
	/>
{/if}
