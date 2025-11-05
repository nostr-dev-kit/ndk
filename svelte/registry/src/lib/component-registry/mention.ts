import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const mentionModernCard: ComponentCardData = {
	name: 'mention-modern',
	title: 'MentionModern',
	richDescription: "Use for rich inline mentions. Modern mention with avatar and user card popover on hover. Shows user's avatar alongside their name with an interactive card on hover.",
	command: 'npx jsrepo add mention-modern',
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
	richDescription: "Minimal mention with automatic profile fetching. Shows loading state then displays user's name. Perfect for simple inline mentions.",
	command: 'npx jsrepo add mention',
	apiDocs: [
		{
			name: 'Mention',
			description: 'Minimal mention component with automatic profile fetching',
			importPath: "import Mention from '$lib/registry/components/mention/mention.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const mentionCustomCard: ComponentCardData = {
	name: 'mention-custom',
	title: 'Custom Styled Mention',
	richDescription: 'Mention with custom styling applied via class prop. Demonstrates style customization for matching your design system.',
	command: 'npx jsrepo add mention',
	apiDocs: [
		{
			name: 'Mention',
			description: 'Minimal mention component with automatic profile fetching',
			importPath: "import Mention from '$lib/registry/components/mention/mention.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const mentionMetadata: ComponentPageMetadata = {
	title: 'Mention',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Different mention styles for various use cases.'
};

export const mentionCards = [mentionModernCard, mentionBasicCard, mentionCustomCard];
