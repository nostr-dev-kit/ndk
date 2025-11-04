import type { ComponentCardData } from '$lib/templates/types';

export const contentNoteBasicCard: ComponentCardData = {
	name: 'event-content-basic',
	title: 'Basic Content Rendering',
	description: 'Auto-detects content types.',
	richDescription: 'Automatically detects and renders mentions, hashtags, links, images, videos, YouTube embeds, and custom emojis.',
	command: 'npx shadcn@latest add event-content',
	apiDocs: []
};

export const contentNoteCustomSnippetsCard: ComponentCardData = {
	name: 'event-content-custom-snippets',
	title: 'Custom Snippets',
	description: 'Override default rendering.',
	richDescription: 'Use custom snippets to override default rendering for any content type (mentions, hashtags, links, etc.).',
	command: 'npx shadcn@latest add event-content',
	apiDocs: []
};

export const contentNoteMetadata = {
	title: 'Event Content',
	description: 'Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.',
	showcaseTitle: 'Examples',
	showcaseDescription: 'Different ways to use EventContent component.',
	cards: [
		contentNoteBasicCard,
		contentNoteCustomSnippetsCard
	],
	apiDocs: []
};
