import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const articleContentCard: ComponentCardData = {
	name: 'article-content',
	title: 'Article Content',
	description: 'Render NIP-23 long-form articles with collaborative highlights',
	richDescription: `A powerful component for rendering NIP-23 long-form articles with intelligent markdown rendering, collaborative highlights, interactive text selection, and floating author avatars—bringing social reading experiences to Nostr.

**Features:**
- **Intelligent Markdown Rendering**: Automatically detects and renders markdown with beautiful typography, or displays plain text with serif fonts for a classic reading experience
- **Collaborative Highlights**: Real-time NIP-23 highlight subscription and rendering. Highlights from multiple users appear inline with floating avatars, creating a social reading experience
- **Interactive Text Selection**: Users can select any text to create highlights instantly. A floating toolbar appears on selection, making it seamless to annotate and share insights
- **Contextual Avatars**: Author avatars float beside highlighted paragraphs, providing visual context about who's engaging with each section of the content
- **Flexible Filtering**: Filter which highlights to display using custom logic. Perfect for showing only highlights from followed users or specific communities
- **Custom Interactions**: Handle highlight clicks to show detailed views, open comment drawers, navigate to author profiles, or trigger any custom action`,
	command: 'npx shadcn@latest add article-content',
	apiDocs: []
};

export const articleContentMetadata: ComponentPageMetadata = {
	title: 'Article Content Renderers',
	description: 'Components for rendering NIP-23 long-form article content with rich formatting and social features.',
	componentsTitle: 'Components',
	componentsDescription: 'Choose the right renderer for your article display needs'
};

export const articleContentCards = [articleContentCard];
