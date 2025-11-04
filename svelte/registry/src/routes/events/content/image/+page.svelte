<script lang="ts">
	import { getContext } from 'svelte';
	import { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ImageCard from '$lib/registry/components/image-card/image-card.svelte';
	import ImageCardInstagram from '$lib/registry/components/image-card/image-card-instagram.svelte';
	import ImageCardHero from '$lib/registry/components/image-card/image-card-hero.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { imageCardMetadata, imageCardCards, imageCardInstagramCard, imageCardHeroCard, imageCardCard, imageCardBasicCard, imageCardCustomCard } from '$lib/component-registry/image-card';
	import type { ShowcaseBlock } from '$lib/templates/types';
	import ComponentAPI from '$site-components/component-api.svelte';

	import UIBasic from './examples/ui-basic.example.svelte';
	import UIFull from './examples/ui-full.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');
	let sampleImage = $state<NDKImage | undefined>();

	$effect(() => {
		(async () => {
			try {
				const events = await ndk.fetchEvents({
					kinds: [20],
					"#t": ["olas365"],
					limit: 1
				});
				const firstEvent = Array.from(events)[0];
				if (firstEvent) {
					sampleImage = NDKImage.from(firstEvent);
				}
			} catch (error) {
				console.error('Failed to fetch image:', error);
			}
		})();
	});

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Instagram',
			description: 'Social feed style card',
			command: 'npx shadcn@latest add image-card-instagram',
			preview: instagramPreview,
			cardData: imageCardInstagramCard
		},
		{
			name: 'Hero',
			description: 'Fullbleed immersive display',
			command: 'npx shadcn@latest add image-card-hero',
			preview: heroPreview,
			cardData: imageCardHeroCard
		},
		{
			name: 'ImageCard',
			description: 'General purpose card',
			command: 'npx shadcn@latest add image-card',
			preview: imageCardPreview,
			cardData: imageCardCard
		},
		{
			name: 'Basic',
			description: 'Minimal image primitive',
			command: 'npx shadcn@latest add image-card',
			preview: basicPreview,
			cardData: imageCardBasicCard
		},
		{
			name: 'Custom',
			description: 'Custom composition',
			command: 'npx shadcn@latest add image-card',
			preview: customPreview,
			cardData: imageCardCustomCard
		}
	];
</script>


{#snippet instagramPreview()}
	{#if sampleImage}
		<div class="max-w-md mx-auto">
			<ImageCardInstagram {ndk} image={sampleImage} />
		</div>
	{/if}
{/snippet}

{#snippet heroPreview()}
	{#if sampleImage}
		<ImageCardHero {ndk} image={sampleImage} />
	{/if}
{/snippet}

{#snippet imageCardPreview()}
	{#if sampleImage}
		<ImageCard {ndk} image={sampleImage} />
	{/if}
{/snippet}

{#snippet basicPreview()}
	{#if sampleImage}
		<UIBasic {ndk} image={sampleImage} />
	{/if}
{/snippet}

{#snippet customPreview()}
	{#if sampleImage}
		<UIFull {ndk} image={sampleImage} />
	{/if}
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'ImageCardInstagram',
				description: 'Instagram-style image card with user header, square image, caption, and action buttons.',
				importPath: "import ImageCardInstagram from '$lib/registry/components/image-card/image-card-instagram.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
					{ name: 'showDropdown', type: 'boolean', default: 'true', description: 'Show dropdown menu button' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'ImageCardHero',
				description: 'Fullbleed immersive display with caption and author info anchored at bottom.',
				importPath: "import ImageCardHero from '$lib/registry/components/image-card/image-card-hero.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
					{ name: 'height', type: 'string', default: 'h-[500px]', description: 'Custom height class' },
					{ name: 'showFollow', type: 'boolean', default: 'true', description: 'Show follow button for author' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'ImageCard',
				description: 'General purpose image card combining EventCard primitives with ImageContent.',
				importPath: "import ImageCard from '$lib/registry/components/image-card/image-card.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
					{ name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
					{ name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable to navigate' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]}
	/>
{/snippet}

{#if sampleImage}
	<ComponentPageTemplate
		metadata={imageCardMetadata}
		{ndk}
		{showcaseBlocks}
		componentsSection={{
			cards: imageCardCards,
			previews: {
				'image-card-instagram': instagramPreview,
				'image-card-hero': heroPreview,
				'image-card': imageCardPreview,
				'image-basic': basicPreview,
				'image-custom': customPreview
			}
		}}
		{customSections}
	>
		<EditProps.Prop name="Sample Image" type="event" bind:value={sampleImage} />
	</ComponentPageTemplate>
{:else}
	<div class="px-8">
		<PageTitle title={imageCardMetadata.title} subtitle={imageCardMetadata.description}>
			<EditProps.Prop name="Sample Image" type="event" bind:value={sampleImage} />
		</PageTitle>
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading sample image...</div>
		</div>
	</div>
{/if}
