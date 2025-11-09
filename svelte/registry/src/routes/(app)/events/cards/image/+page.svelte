<script lang="ts">
	import { getContext } from 'svelte';
	import { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ImageCard from '$lib/registry/components/image/cards/basic/image-card.svelte';
	import ImageCardInstagram from '$lib/registry/components/image/cards/basic/image-card-instagram.svelte';
	import ImageCardHero from '$lib/registry/components/image/cards/hero/image-card-hero.svelte';
	import { EditProps } from '$lib/site/components/edit-props';
	import PageTitle from '$lib/site/components/PageTitle.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import type { ShowcaseComponent } from '$lib/site/templates/types';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import registry metadata
	import imageCardBasicCard from '$lib/registry/components/image/cards/basic/metadata.json';
	import imageCardHeroCardBase from '$lib/registry/components/image/cards/hero/metadata.json';

	// Create variant cards
	const imageCardCard = { ...imageCardBasicCard, name: 'image-card', title: 'Image Card' };
	const imageCardInstagramCard = { ...imageCardBasicCard, name: 'image-card-instagram', title: 'Image Card Instagram', variant: 'instagram' };
	const imageCardHeroCard = { ...imageCardHeroCardBase, name: 'image-card-hero', title: 'Image Card Hero' };

	const imageCardCards = [imageCardCard, imageCardInstagramCard, imageCardHeroCard];

  // Get page data
  let { data } = $props();
  const { metadata } = data;

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

	const showcaseComponents: ShowcaseComponent[] = [
    {
      id: 'image-card-instagram',
      cardData: imageCardInstagramCard,
      preview: instagramPreview,
      orientation: 'vertical'
    },
    {
      id: 'image-card-hero',
      cardData: imageCardHeroCard,
      preview: heroPreview,
      orientation: 'vertical'
    },
    {
      id: 'image-card-basic',
      cardData: imageCardCard,
      preview: imageCardPreview,
      orientation: 'vertical'
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

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'ImageCardInstagram',
				description: 'Instagram-style image card with user header, square image, caption, and action buttons.',
				importPath: "import ImageCardInstagram from '$lib/registry/components/image/cards/basic/image-card-instagram.svelte'",
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
				importPath: "import ImageCardHero from '$lib/registry/components/image/cards/hero/image-card-hero.svelte'",
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
				importPath: "import ImageCard from '$lib/registry/components/image/cards/basic/image-card.svelte'",
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
		metadata={metadata}
		{ndk}
		{showcaseComponents}
		componentsSection={{
			cards: imageCardCards,
			previews: {
				'image-card-instagram': instagramPreview,
				'image-card-hero': heroPreview,
				'image-card': imageCardPreview
			}
		}}
		{customSections}
	>
		<EditProps.Prop name="Sample Image" type="event" bind:value={sampleImage} />
	</ComponentPageTemplate>
{:else}
	<div class="px-8">
		<PageTitle title={metadata.title} subtitle={metadata.description}>
			<EditProps.Prop name="Sample Image" type="event" bind:value={sampleImage} />
		</PageTitle>
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading sample image...</div>
		</div>
	</div>
{/if}
