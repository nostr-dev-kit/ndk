import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const hashtagModernCard: ComponentCardData = {
	name: 'hashtag-modern',
	title: 'HashtagModern',
	description: 'Rich hashtag with stats card on hover.',
	richDescription: 'Modern hashtag with gradient indicator and stats card popover on hover. Shows hashtag activity, contributors, and follow button when hovered.',
	command: 'npx shadcn@latest add hashtag-modern',
	apiDocs: [
		{
			name: 'HashtagModern',
			description: 'Modern inline hashtag with stats card popover on hover',
			importPath: "import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'tag', type: 'string', required: true, description: 'Hashtag text (with or without # prefix)' },
				{ name: 'onclick', type: '(tag: string) => void', description: 'Optional click handler' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const hashtagBasicCard: ComponentCardData = {
	name: 'hashtag-basic',
	title: 'Basic Hashtag',
	description: 'Minimal clickable hashtag.',
	richDescription: 'Minimal clickable hashtag component. Shows hashtag with default styling and optional click handler. Perfect for simple inline hashtags.',
	command: 'npx shadcn@latest add hashtag',
	apiDocs: []
};

export const hashtagCustomCard: ComponentCardData = {
	name: 'hashtag-custom',
	title: 'Custom Styled Hashtag',
	description: 'Hashtag with custom styling.',
	richDescription: 'Hashtag with custom styling applied via class prop. Demonstrates style customization for matching your design system.',
	command: 'npx shadcn@latest add hashtag',
	apiDocs: []
};

export const hashtagInteractiveCard: ComponentCardData = {
	name: 'hashtag-interactive',
	title: 'Interactive Hashtag',
	description: 'Hashtag with click handler.',
	richDescription: 'Interactive hashtag with click handler. Demonstrates how to handle hashtag clicks for navigation or filtering.',
	command: 'npx shadcn@latest add hashtag',
	apiDocs: []
};

export const hashtagMetadata: ComponentPageMetadata = {
	title: 'Hashtag',
	description: 'Render inline hashtags with customizable styling and click handlers. Display hashtag references in event content with interactive features.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Different hashtag styles for various use cases.'
};

export const hashtagCards = [hashtagModernCard, hashtagBasicCard, hashtagCustomCard, hashtagInteractiveCard];
