import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const noteContentCard: ComponentCardData = {
	name: 'event-content-note',
	title: 'EventContent - Note (Kind:1)',
	description: 'Renders short-form text notes.',
	richDescription: 'Renders short-form text notes with automatic parsing of mentions, hashtags, links, images, videos, and custom emojis.',
	command: 'npx shadcn@latest add event-content',
	apiDocs: []
};

export const articleContentIntroCard: ComponentCardData = {
	name: 'article-content',
	title: 'ArticleContent - Article (NIP-23)',
	description: 'Renders long-form articles.',
	richDescription: 'Renders long-form articles with markdown support, inline highlights, and text selection. Supports images, code blocks, lists, and rich formatting.',
	command: 'npx shadcn@latest add article-content',
	apiDocs: []
};

export const contentIntroductionMetadata: ComponentPageMetadata = {
	title: 'Content Components',
	description: 'Understanding content rendering in NDK Components',
	showcaseTitle: 'Content Renderers',
	showcaseDescription: 'Different content types and their specialized renderers.'
};

export const contentIntroductionCards = [noteContentCard, articleContentIntroCard];
