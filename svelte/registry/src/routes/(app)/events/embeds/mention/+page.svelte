<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { mentionMetadata, mentionCards, mentionModernCard, mentionBasicCard, mentionCustomCard } from '$lib/component-registry/mention';
	import type { ShowcaseBlock } from '$lib/templates/types';

	import UIBasic from './examples/ui-basic.example.svelte';
	import UIFull from './examples/ui-full.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Modern',
			description: 'Rich mention with avatar',
			command: 'npx jsrepo add mention-modern',
			preview: mentionModernPreview,
			cardData: mentionModernCard
		},
		{
			name: 'Basic',
			description: 'Minimal mention',
			command: 'npx jsrepo add mention',
			preview: basicPreview,
			cardData: mentionBasicCard
		},
		{
			name: 'Custom',
			description: 'Custom styled',
			command: 'npx jsrepo add mention',
			preview: customPreview,
			cardData: mentionCustomCard
		}
	];
</script>

{#snippet mentionModernPreview()}
	<div class="p-4 border rounded-lg">
		<p class="text-sm">
			Hey <MentionModern
				{ndk}
				bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
			/>, check this out!
		</p>
	</div>
{/snippet}

{#snippet basicPreview()}
	<UIBasic {ndk} />
{/snippet}

{#snippet customPreview()}
	<UIFull {ndk} />
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'MentionModern',
				description: 'Modern inline mention with avatar and user card popover on hover',
				importPath: "import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'Mention (UI Primitive)',
				description: 'Headless mention primitive with automatic profile fetching',
				importPath: "import { Mention } from '$lib/registry/ui/mention'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]}
	/>
{/snippet}

{#if true}
	{@const previews = {
		'mention-modern': mentionModernPreview,
		'mention-basic': basicPreview,
		'mention-custom': customPreview
	} as any}
	<ComponentPageTemplate
	metadata={mentionMetadata}
	{ndk}
	{showcaseBlocks}
	componentsSection={{
		cards: mentionCards,
		previews
	}}
	{customSections}
	/>
{/if}
