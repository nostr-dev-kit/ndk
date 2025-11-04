import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const articleContentBasicCard: ComponentCardData = {
	name: 'article-content-basic',
	title: 'Basic Usage',
	description: 'Render article with highlights.',
	richDescription: 'Render article content with automatic highlight subscription. Select text to create highlights.',
	command: 'npx shadcn@latest add article-content',
	apiDocs: []
};

export const articleContentWithClickCard: ComponentCardData = {
	name: 'article-content-with-click',
	title: 'With Click Handler',
	description: 'Handle highlight clicks.',
	richDescription: 'Handle highlight clicks to show details, open drawers, etc. You can also filter highlights using the highlightFilter callback.',
	command: 'npx shadcn@latest add article-content',
	apiDocs: []
};

export const articleContentMetadata: ComponentPageMetadata = {
	title: 'ArticleContent',
	description: 'Render NIP-23 article content with markdown support, inline highlights, text selection, and floating avatars. Automatically subscribes to highlights and allows users to create new ones by selecting text.',
	showcaseTitle: 'Examples',
	showcaseDescription: 'See ArticleContent in action.'
};

export const articleContentCards = [articleContentBasicCard, articleContentWithClickCard];
