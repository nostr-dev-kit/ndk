<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import HashtagModern from '$lib/registry/components/hashtag/displays/modern/hashtag-modern.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';	import type { ShowcaseComponent } from '$lib/site/templates/types';

	import UIModern from './examples/ui-modern.example.svelte';
	import UIBasic from './examples/ui-basic.example.svelte';
	import UICustom from './examples/ui-custom.example.svelte';
	import UIInteractive from './examples/ui-interactive.example.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

	const ndk = getContext<NDKSvelte>('ndk');

	const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: hashtagModernCard,
      preview: modernPreview
    },
    {
      cardData: hashtagBasicCard,
      preview: basicPreview
    },
    {
      cardData: hashtagCustomCard,
      preview: customPreview
    },
    {
      cardData: hashtagInteractiveCard,
      preview: interactivePreview
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
				importPath: "import HashtagModern from '$lib/registry/components/hashtag/displays/modern/hashtag-modern.svelte'",
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
	metadata={metadata}
	{ndk}
	{showcaseComponents}
	componentsSection={{
		cards: hashtagCards,
		previews
	}}
	{customSections}
	/>
{/if}
