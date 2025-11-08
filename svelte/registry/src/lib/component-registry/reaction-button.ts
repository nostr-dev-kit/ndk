import type { ComponentCardData } from '$lib/templates/types';

export const reactionButtonBasicCard: ComponentCardData = {
	name: 'reaction-button-basic',
	title: 'ReactionButton - Basic',
	richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside other action buttons. Click to react with a heart.',
	command: 'npx jsrepo add reaction-button',
	apiDocs: [
		{
			name: 'ReactionButton',
			description: 'Minimal reaction button with icon and count',
			importPath: "import { ReactionButton } from '$lib/registry/components/reaction-button'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to react to' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Emoji to use for reaction' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Whether to show reaction count' },
				{ name: 'delayed', type: 'number', description: 'Delay in seconds before publishing (for cancellable reactions)' },
				{ name: 'onclick', type: '() => void', description: 'Handler called when button is clicked' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionButtonVariantsCard: ComponentCardData = {
	name: 'reaction-button-variants',
	title: 'ReactionButton - Style Variants',
	richDescription: 'Available in ghost, outline, pill, and solid variants to match your design system.',
	command: 'npx jsrepo add reaction-button',
	apiDocs: [
		{
			name: 'ReactionButton',
			description: 'Minimal reaction button with icon and count',
			importPath: "import { ReactionButton } from '$lib/registry/components/reaction-button'",
			props: [
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' }
			]
		}
	]
};

export const reactionButtonMetadata = {
	title: 'Reaction Button',
	showcaseTitle: 'Simple Reaction Button',
	showcaseDescription: 'A minimal reaction button with optional count display. Click to react with default emoji.',
	cards: [
		reactionButtonBasicCard,
		reactionButtonVariantsCard
	],
	apiDocs: [
		{
			name: 'ReactionButton',
			description: 'Minimal reaction button with icon and count',
			importPath: "import { ReactionButton } from '$lib/registry/components/reaction-button'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to react to' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Emoji to use for reaction' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Whether to show reaction count' },
				{ name: 'delayed', type: 'number', description: 'Delay in seconds before publishing (for cancellable reactions)' },
				{ name: 'onclick', type: '() => void', description: 'Handler called when button is clicked' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};