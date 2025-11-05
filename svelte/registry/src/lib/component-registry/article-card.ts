import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const articleCardPortraitCard: ComponentCardData = {
	name: 'article-card-portrait',
	title: 'ArticleCardPortrait',
	description: 'Portrait-style layout with vertical orientation.',
	richDescription: 'Ideal for grid layouts and featured content displays. This card presents articles in a vertical portrait orientation with the image at the top, followed by title, summary, and reading time.',
	command: 'npx jsrepo add article-card-portrait',
	apiDocs: [
		{
			name: 'ArticleCardPortrait',
			description: 'Portrait-style article card component',
			importPath: "import { ArticleCardPortrait } from '$lib/registry/components/article-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const articleCardHeroCard: ComponentCardData = {
	name: 'article-card-hero',
	title: 'ArticleCardHero',
	description: 'Full-width hero card with overlay content.',
	richDescription: 'Perfect for featured articles and landing pages. This card uses the full width with an image background and overlay content including title and summary.',
	command: 'npx jsrepo add article-card-hero',
	apiDocs: [
		{
			name: 'ArticleCardHero',
			description: 'Hero-style article card component',
			importPath: "import { ArticleCardHero } from '$lib/registry/components/article-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const articleCardMediumCard: ComponentCardData = {
	name: 'article-card-medium',
	title: 'ArticleCardMedium',
	description: 'Compact horizontal card with side image.',
	richDescription: 'Optimized for article lists and content feeds. This horizontal card layout places the image on the right side with title and metadata on the left, perfect for list views.',
	command: 'npx jsrepo add article-card-medium',
	apiDocs: [
		{
			name: 'ArticleCardMedium',
			description: 'Medium horizontal article card component',
			importPath: "import { ArticleCardMedium } from '$lib/registry/components/article-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const articleCardNeonCard: ComponentCardData = {
	name: 'article-card-neon',
	title: 'ArticleCardNeon',
	description: 'Modern design with vibrant neon accents and gradients.',
	richDescription: 'Striking visual impact with neon borders and gradient effects. This modern card design uses vibrant colors and glowing effects to make articles stand out.',
	command: 'npx jsrepo add article-card-neon',
	apiDocs: [
		{
			name: 'ArticleCardNeon',
			description: 'Neon-style article card component with vibrant accents',
			importPath: "import { ArticleCardNeon } from '$lib/registry/components/article-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'article', type: 'NDKArticle', description: 'Article instance to display', required: true },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const articleCardMetadata: ComponentPageMetadata = {
	title: 'Article Card',
	description: 'Display Nostr long-form articles with rich metadata and previews. Built using composable headless primitives with multiple ready-made variants optimized for different layouts.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Beautifully crafted. Each optimized for its purpose. Choose the perfect presentation for your content.'
};

export const articleCardCards = [
	articleCardPortraitCard,
	articleCardHeroCard,
	articleCardMediumCard,
	articleCardNeonCard
];
