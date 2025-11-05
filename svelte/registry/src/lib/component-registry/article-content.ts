import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const articleContentBasicCard: ComponentCardData = {
	name: 'article-content-basic',
	title: 'Article Content Basic',
	command: 'npx jsrepo add article-content-basic',
	apiDocs: [
		{
			name: 'ArticleContentBasic',
			description: 'Renders long-form article content with automatic markdown parsing and formatting. No collaborative features.',
			importPath: "import { ArticleContentBasic } from '$lib/registry/components/article-content/article-content-basic.svelte'",
			props: [
				{
					name: 'article',
					type: 'NDKArticle',
					required: true,
					description: 'The article event to render (NIP-23)'
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

export const articleContentCard: ComponentCardData = {
	name: 'article-content',
	title: 'Article Content',
	command: 'npx jsrepo add article-content',
	apiDocs: [
		{
			name: 'ArticleContent',
			description: 'Full-featured article renderer with markdown support, text selection, and collaborative highlights (NIP-23). Displays highlights from other users and allows creating new ones.',
			importPath: "import { ArticleContent } from '$lib/registry/components/article-content/article-content.svelte'",
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
					description: 'The article event to render (NIP-23)'
				},
				{
					name: 'highlightFilter',
					type: '(highlight: NDKHighlight) => boolean',
					description: 'Optional filter function to control which highlights are displayed'
				},
				{
					name: 'onHighlightClick',
					type: '(highlight: NDKHighlight) => void',
					description: 'Callback fired when a highlight is clicked'
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

export const articleContentMetadata: ComponentPageMetadata = {
	title: 'Article Content Renderers',
	componentsTitle: 'Components',
	componentsDescription: 'Choose the right renderer for your article display needs'
};

export const articleContentCards = [articleContentBasicCard, articleContentCard];
