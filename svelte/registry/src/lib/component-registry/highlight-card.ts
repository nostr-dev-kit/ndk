import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const highlightCardFeedCard: ComponentCardData = {
	name: 'highlight-card-feed',
	title: 'Feed',
	description: 'Full-width card for main feed displays.',
	richDescription: 'Full-width card with header, large highlighted text in a book-page style, source badge, and action buttons. Best for main feed displays.',
	command: 'npx jsrepo add highlight-card-feed',
	apiDocs: [
		{
			name: 'HighlightCardFeed',
			description: 'Full-width highlight card optimized for feed displays with header, content, and actions.',
			importPath: "import { HighlightCardFeed } from '$lib/registry/components/highlight-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Highlight event (kind 9802)' },
				{ name: 'showHeader', type: 'boolean', default: 'true', description: 'Show author header' },
				{ name: 'showActions', type: 'boolean', default: 'true', description: 'Show actions footer' },
				{ name: 'actions', type: 'Snippet', description: 'Custom actions slot' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const highlightCardElegantCard: ComponentCardData = {
	name: 'highlight-card-elegant',
	title: 'Elegant',
	description: 'Square card with gradient background.',
	richDescription: 'Square-sized elegant card with gradient background. Context text is muted while the highlight is bright with primary foreground color.',
	command: 'npx jsrepo add highlight-card-elegant',
	apiDocs: [
		{
			name: 'HighlightCardElegant',
			description: 'Square elegant card with gradient background for grid displays.',
			importPath: "import { HighlightCardElegant } from '$lib/registry/components/highlight-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Highlight event (kind 9802)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const highlightCardCompactCard: ComponentCardData = {
	name: 'highlight-card-compact',
	title: 'Compact',
	description: 'Small horizontal card layout.',
	richDescription: 'Small horizontal card layout. Ideal for compact lists and sidebars.',
	command: 'npx jsrepo add highlight-card-compact',
	apiDocs: [
		{
			name: 'HighlightCardCompact',
			description: 'Compact horizontal highlight card for lists and sidebars.',
			importPath: "import { HighlightCardCompact } from '$lib/registry/components/highlight-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Highlight event (kind 9802)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const highlightCardGridCard: ComponentCardData = {
	name: 'highlight-card-grid',
	title: 'Grid',
	description: 'Square card for grid layouts.',
	richDescription: 'Square card perfect for grid layouts. Shows highlight with optional author info below.',
	command: 'npx jsrepo add highlight-card-grid',
	apiDocs: [
		{
			name: 'HighlightCardGrid',
			description: 'Square highlight card optimized for grid layouts.',
			importPath: "import { HighlightCardGrid } from '$lib/registry/components/highlight-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Highlight event (kind 9802)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const highlightCardBasicCard: ComponentCardData = {
	name: 'highlight-basic',
	title: 'Basic Usage',
	description: 'Minimal primitives example.',
	richDescription: 'Minimal example with HighlightCard.Root and essential primitives. Build custom layouts by composing primitives.',
	command: 'npx jsrepo add highlight-card',
	apiDocs: [
		{
			name: 'Highlight.Root',
			description: 'Root component providing highlight context to all child primitives.',
			importPath: "import { Highlight } from '$lib/registry/ui/highlight'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Highlight event (kind 9802)' },
				{ name: 'variant', type: 'string', description: 'Variant style (feed, elegant, grid, compact)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'Highlight.Content',
			description: 'Displays the highlighted text content.',
			importPath: "import { Highlight } from '$lib/registry/ui/highlight'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'Highlight.Source',
			description: 'Displays the source reference (URL or article title) extracted from the highlight.',
			importPath: "import { Highlight } from '$lib/registry/ui/highlight'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const highlightCardCompositionCard: ComponentCardData = {
	name: 'highlight-composition',
	title: 'Full Composition',
	description: 'All primitives composed together.',
	richDescription: 'All available primitives composed together demonstrating the flexibility of the primitive-based approach.',
	command: 'npx jsrepo add highlight-card',
	apiDocs: [
		{
			name: 'Highlight.Context',
			description: 'Displays surrounding context text (if available in the highlight event).',
			importPath: "import { Highlight } from '$lib/registry/ui/highlight'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const highlightCardMetadata: ComponentPageMetadata = {
	title: 'HighlightCard',
	description: 'Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable layouts. Automatically extracts and displays source references.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Pre-composed layouts ready to use.'
};

export const highlightCardCards = [
	highlightCardFeedCard,
	highlightCardElegantCard,
	highlightCardCompactCard,
	highlightCardGridCard
];
