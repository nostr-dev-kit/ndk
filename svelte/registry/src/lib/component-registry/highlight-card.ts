import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const highlightCardFeedCard: ComponentCardData = {
	name: 'highlight-card-feed',
	title: 'Feed',
	description: 'Full-width card for main feed displays.',
	richDescription: 'Full-width card with header, large highlighted text in a book-page style, source badge, and action buttons. Best for main feed displays.',
	command: 'npx shadcn@latest add highlight-card-feed',
	apiDocs: []
};

export const highlightCardElegantCard: ComponentCardData = {
	name: 'highlight-card-elegant',
	title: 'Elegant',
	description: 'Square card with gradient background.',
	richDescription: 'Square-sized elegant card with gradient background. Context text is muted while the highlight is bright with primary foreground color.',
	command: 'npx shadcn@latest add highlight-card-elegant',
	apiDocs: []
};

export const highlightCardCompactCard: ComponentCardData = {
	name: 'highlight-card-compact',
	title: 'Compact',
	description: 'Small horizontal card layout.',
	richDescription: 'Small horizontal card layout. Ideal for compact lists and sidebars.',
	command: 'npx shadcn@latest add highlight-card-compact',
	apiDocs: []
};

export const highlightCardGridCard: ComponentCardData = {
	name: 'highlight-card-grid',
	title: 'Grid',
	description: 'Square card for grid layouts.',
	richDescription: 'Square card perfect for grid layouts. Shows highlight with optional author info below.',
	command: 'npx shadcn@latest add highlight-card-grid',
	apiDocs: []
};

export const highlightCardBasicCard: ComponentCardData = {
	name: 'highlight-basic',
	title: 'Basic Usage',
	description: 'Minimal primitives example.',
	richDescription: 'Minimal example with HighlightCard.Root and essential primitives. Build custom layouts by composing primitives.',
	command: 'npx shadcn@latest add highlight-card',
	apiDocs: []
};

export const highlightCardCompositionCard: ComponentCardData = {
	name: 'highlight-composition',
	title: 'Full Composition',
	description: 'All primitives composed together.',
	richDescription: 'All available primitives composed together demonstrating the flexibility of the primitive-based approach.',
	command: 'npx shadcn@latest add highlight-card',
	apiDocs: []
};

export const highlightCardMetadata: ComponentPageMetadata = {
	title: 'HighlightCard',
	description: 'Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable layouts. Automatically extracts and displays source references.',
	showcaseTitle: 'Blocks',
	showcaseDescription: 'Pre-composed layouts ready to use.'
};

export const highlightCardCards = [
	highlightCardFeedCard,
	highlightCardElegantCard,
	highlightCardCompactCard,
	highlightCardGridCard,
	highlightCardBasicCard,
	highlightCardCompositionCard
];
