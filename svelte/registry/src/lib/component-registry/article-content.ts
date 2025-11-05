import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const articleContentBasicCard: ComponentCardData = {
	name: 'article-content-basic',
	title: 'Article Content Basic',
	description: 'Simple markdown rendering for long-form articles',
	command: 'npx shadcn@latest add article-content-basic',
	apiDocs: []
};

export const articleContentCard: ComponentCardData = {
	name: 'article-content',
	title: 'Article Content',
	description: 'Full-featured article renderer with collaborative highlights',
	command: 'npx shadcn@latest add article-content',
	apiDocs: []
};

export const articleContentMetadata: ComponentPageMetadata = {
	title: 'Article Content Renderers',
	description: 'Components for rendering NIP-23 long-form article content with rich formatting and social features.',
	componentsTitle: 'Components',
	componentsDescription: 'Choose the right renderer for your article display needs'
};

export const articleContentCards = [articleContentBasicCard, articleContentCard];
