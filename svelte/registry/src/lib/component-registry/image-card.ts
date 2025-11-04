import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const imageCardInstagramCard: ComponentCardData = {
	name: 'image-card-instagram',
	title: 'ImageCardInstagram',
	description: 'Instagram-style image card.',
	richDescription: 'Classic Instagram-style card with user header, square image, caption, and action buttons. Perfect for social feed layouts.',
	command: 'npx shadcn@latest add image-card-instagram',
	apiDocs: [
		{
			name: 'ImageCardInstagram',
			description: 'Instagram-style image card component',
			importPath: "import ImageCardInstagram from '$lib/registry/components/image-card/image-card-instagram.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
				{ name: 'showDropdown', type: 'boolean', default: 'true', description: 'Show dropdown menu button' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const imageCardHeroCard: ComponentCardData = {
	name: 'image-card-hero',
	title: 'ImageCardHero',
	description: 'Fullbleed immersive image display.',
	richDescription: 'Fullbleed immersive display with caption and author info anchored at bottom over gradient. Perfect for featured or detail views.',
	command: 'npx shadcn@latest add image-card-hero',
	apiDocs: [
		{
			name: 'ImageCardHero',
			description: 'Hero-style fullbleed image card component',
			importPath: "import ImageCardHero from '$lib/registry/components/image-card/image-card-hero.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
				{ name: 'height', type: 'string', default: 'h-[500px]', description: 'Custom height class' },
				{ name: 'showFollow', type: 'boolean', default: 'true', description: 'Show follow button for author' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const imageCardCard: ComponentCardData = {
	name: 'image-card',
	title: 'ImageCard',
	description: 'General purpose image card.',
	richDescription: 'Combines EventCard primitives with ImageContent for flexible layouts. Perfect for general purpose image display.',
	command: 'npx shadcn@latest add image-card',
	apiDocs: [
		{
			name: 'ImageCard',
			description: 'General purpose image card component',
			importPath: "import ImageCard from '$lib/registry/components/image-card/image-card.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
				{ name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
				{ name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable to navigate' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const imageCardBasicCard: ComponentCardData = {
	name: 'image-basic',
	title: 'Basic Image Content',
	description: 'Basic image rendering primitive.',
	richDescription: 'Minimal image rendering with ImageContent primitive. Perfect for building custom layouts.',
	command: 'npx shadcn@latest add image-card',
	apiDocs: []
};

export const imageCardCustomCard: ComponentCardData = {
	name: 'image-custom',
	title: 'Custom Image Layout',
	description: 'Custom image composition.',
	richDescription: 'Custom image layout using ImageContent primitives for full control over appearance.',
	command: 'npx shadcn@latest add image-card',
	apiDocs: []
};

export const imageCardMetadata: ComponentPageMetadata = {
	title: 'Image Content',
	description: 'Display image events with metadata and interactions. ImageContent renders images from NIP-68 events (kind 20) with support for multiple images, dimensions, file size, MIME types, and alt text.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Image card variants from social feeds to hero displays.'
};

export const imageCardCards = [
	imageCardInstagramCard,
	imageCardHeroCard,
	imageCardCard,
	imageCardBasicCard,
	imageCardCustomCard
];
