import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const mentionModernCard: ComponentCardData = {
	name: 'mention-modern',
	title: 'MentionModern',
	description: 'Rich inline mention with avatar and popover.',
	richDescription: "Use for rich inline mentions. Modern mention with avatar and user card popover on hover. Shows user's avatar alongside their name with an interactive card on hover.",
	command: 'npx shadcn@latest add mention-modern',
	apiDocs: [
		{
			name: 'MentionModern',
			description: 'Modern inline mention with avatar and user card popover on hover',
			importPath: "import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const mentionBasicCard: ComponentCardData = {
	name: 'mention-basic',
	title: 'Basic Mention',
	description: 'Minimal mention with profile fetching.',
	richDescription: "Minimal mention with automatic profile fetching. Shows loading state then displays user's name. Perfect for simple inline mentions.",
	command: 'npx shadcn@latest add mention',
	apiDocs: []
};

export const mentionCustomCard: ComponentCardData = {
	name: 'mention-custom',
	title: 'Custom Styled Mention',
	description: 'Mention with custom styling.',
	richDescription: 'Mention with custom styling applied via class prop. Demonstrates style customization for matching your design system.',
	command: 'npx shadcn@latest add mention',
	apiDocs: []
};

export const mentionMetadata: ComponentPageMetadata = {
	title: 'Mention',
	description: 'Render inline user mentions with automatic profile fetching. Display user references in event content with customizable styling and interactive features.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Different mention styles for various use cases.'
};

export const mentionCards = [mentionModernCard, mentionBasicCard, mentionCustomCard];
