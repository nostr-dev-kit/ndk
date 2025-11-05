import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const noteContentCard: ComponentCardData = {
	name: 'event-content-note',
	title: 'EventContent - Note (Kind:1)',
	richDescription: 'Renders short-form text notes with automatic parsing of mentions, hashtags, links, images, videos, and custom emojis.',
	command: 'npx jsrepo add event-content',
	apiDocs: [
		{
			name: 'EventContent',
			description: 'Universal event content renderer that parses and displays event content with support for mentions, hashtags, links, media, and custom emojis.',
			importPath: "import { EventContent } from '$lib/registry/ui/event-content.svelte'",
			props: [
				{
					name: 'ndk',
					type: 'NDKSvelte',
					required: true,
					description: 'NDK instance'
				},
				{
					name: 'event',
					type: 'NDKEvent',
					description: 'The event to render content from'
				},
				{
					name: 'content',
					type: 'string',
					description: 'Raw content string (alternative to event)'
				},
				{
					name: 'emojiTags',
					type: 'string[][]',
					description: 'Custom emoji tags from the event'
				},
				{
					name: 'renderer',
					type: 'ContentRenderer',
					description: 'Custom renderer configuration for overriding how segments are displayed'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		}
	]
};

export const articleContentIntroCard: ComponentCardData = {
	name: 'article-content',
	title: 'ArticleContent - Article (NIP-23)',
	richDescription: 'Renders long-form articles with markdown support, inline highlights, and text selection. Supports images, code blocks, lists, and rich formatting.',
	command: 'npx jsrepo add article-content',
	apiDocs: [
		{
			name: 'ArticleContent',
			description: 'Renders long-form articles with markdown support, inline highlights, and text selection. Automatically detects and parses markdown, displays highlights from other users, and allows text selection for creating new highlights.',
			importPath: "import ArticleContent from '$lib/registry/components/article-content/article-content.svelte'",
			props: [
				{
					name: 'ndk',
					type: 'NDKSvelte',
					description: 'NDK instance. Optional if NDK is available in Svelte context.'
				},
				{
					name: 'article',
					type: 'NDKArticle',
					required: true,
					description: 'The article event to display (kind 30023)'
				},
				{
					name: 'highlightFilter',
					type: '(highlight: NDKHighlight) => boolean',
					description: 'Filter function to control which highlights are displayed'
				},
				{
					name: 'onHighlightClick',
					type: '(highlight: NDKHighlight) => void',
					description: 'Callback when a highlight is clicked'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		}
	]
};

export const contentIntroductionMetadata: ComponentPageMetadata = {
	title: 'Content Components',
	showcaseTitle: 'Content Renderers',
	showcaseDescription: 'Different content types and their specialized renderers.'
};

export const contentIntroductionCards = [noteContentCard, articleContentIntroCard];
