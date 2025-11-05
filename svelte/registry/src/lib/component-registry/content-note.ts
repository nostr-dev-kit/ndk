import type { ComponentCardData } from '$lib/templates/types';

export const contentNoteBasicCard: ComponentCardData = {
	name: 'event-content-basic',
	title: 'Basic Content Rendering',
	description: 'Auto-detects content types.',
	richDescription: 'Automatically detects and renders mentions, hashtags, links, images, videos, YouTube embeds, and custom emojis.',
	command: 'npx jsrepo add event-content',
	apiDocs: [
		{
			name: 'EventContent',
			description: 'Rich event content renderer with automatic parsing',
			importPath: "import { EventContent } from '$lib/registry/components/event-content'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to render content from' },
				{ name: 'mention', type: 'Snippet<[{ bech32: string }]>', description: 'Custom mention renderer snippet' },
				{ name: 'hashtag', type: 'Snippet<[{ tag: string }]>', description: 'Custom hashtag renderer snippet' },
				{ name: 'link', type: 'Snippet<[{ url: string }]>', description: 'Custom link renderer snippet' },
				{ name: 'image', type: 'Snippet<[{ url: string }]>', description: 'Custom image renderer snippet' },
				{ name: 'video', type: 'Snippet<[{ url: string }]>', description: 'Custom video renderer snippet' },
				{ name: 'youtube', type: 'Snippet<[{ videoId: string }]>', description: 'Custom YouTube embed snippet' },
				{ name: 'emoji', type: 'Snippet<[{ name: string, url: string }]>', description: 'Custom emoji renderer snippet' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const contentNoteCustomSnippetsCard: ComponentCardData = {
	name: 'event-content-custom-snippets',
	title: 'Custom Snippets',
	description: 'Override default rendering.',
	richDescription: 'Use custom snippets to override default rendering for any content type (mentions, hashtags, links, etc.).',
	command: 'npx jsrepo add event-content',
	apiDocs: [
		{
			name: 'EventContent',
			description: 'Rich event content renderer with automatic parsing and customizable snippets',
			importPath: "import { EventContent } from '$lib/registry/components/event-content'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to render content from' },
				{ name: 'mention', type: 'Snippet<[{ bech32: string }]>', description: 'Custom mention renderer snippet' },
				{ name: 'hashtag', type: 'Snippet<[{ tag: string }]>', description: 'Custom hashtag renderer snippet' },
				{ name: 'link', type: 'Snippet<[{ url: string }]>', description: 'Custom link renderer snippet' },
				{ name: 'image', type: 'Snippet<[{ url: string }]>', description: 'Custom image renderer snippet' },
				{ name: 'video', type: 'Snippet<[{ url: string }]>', description: 'Custom video renderer snippet' },
				{ name: 'youtube', type: 'Snippet<[{ videoId: string }]>', description: 'Custom YouTube embed snippet' },
				{ name: 'emoji', type: 'Snippet<[{ name: string, url: string }]>', description: 'Custom emoji renderer snippet' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
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
	apiDocs: [
		{
			name: 'EventContent',
			description: 'Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis',
			importPath: "import { EventContent } from '$lib/registry/components/event-content'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to render content from' },
				{ name: 'mention', type: 'Snippet<[{ bech32: string }]>', description: 'Custom mention renderer snippet' },
				{ name: 'hashtag', type: 'Snippet<[{ tag: string }]>', description: 'Custom hashtag renderer snippet' },
				{ name: 'link', type: 'Snippet<[{ url: string }]>', description: 'Custom link renderer snippet' },
				{ name: 'image', type: 'Snippet<[{ url: string }]>', description: 'Custom image renderer snippet' },
				{ name: 'video', type: 'Snippet<[{ url: string }]>', description: 'Custom video renderer snippet' },
				{ name: 'youtube', type: 'Snippet<[{ videoId: string }]>', description: 'Custom YouTube embed snippet' },
				{ name: 'emoji', type: 'Snippet<[{ name: string, url: string }]>', description: 'Custom emoji renderer snippet' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};
