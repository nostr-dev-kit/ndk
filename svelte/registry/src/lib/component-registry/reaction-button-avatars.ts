import type { ComponentCardData } from '$lib/templates/types';

export const reactionButtonAvatarsBasicCard: ComponentCardData = {
	name: 'reaction-button-avatars-basic',
	title: 'Reaction Button Avatars',
	richDescription: 'Displays a group of avatars representing the authors of reactions to an event. Shows up to a configurable number of avatars with an overflow count.',
	command: 'npx jsrepo add reaction-button-avatars',
	apiDocs: [
		{
			name: 'ReactionButtonAvatars',
			description: 'Component that displays avatars of users who have reacted to an event',
			importPath: "import { ReactionButtonAvatars } from '$lib/registry/components/reaction/displays/avatars'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, uses context if not provided)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show reaction authors for' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Filter by specific emoji' },
				{ name: 'max', type: 'number', default: '3', description: 'Maximum number of avatars to display before showing overflow' },
				{ name: 'avatarSize', type: 'number', default: '24', description: 'Size of each avatar in pixels' },
				{ name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Spacing between avatars' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show total reaction count' },
				{ name: 'onclick', type: '() => void', description: 'Handler called when button is clicked' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionButtonAvatarsVariantsCard: ComponentCardData = {
	name: 'reaction-button-avatars-variants',
	title: 'Style Variants',
	richDescription: 'Available in ghost, outline, pill, and solid variants to match your design system.',
	command: 'npx jsrepo add reaction-button-avatars',
	apiDocs: [
		{
			name: 'ReactionButtonAvatars',
			description: 'Component that displays avatars of users who have reacted',
			importPath: "import { ReactionButtonAvatars } from '$lib/registry/components/reaction/displays/avatars'",
			props: [
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' }
			]
		}
	]
};

export const reactionButtonAvatarsMetadata = {
	title: 'Reaction Button Avatars',
	showcaseTitle: 'Reaction Avatars Display',
	showcaseDescription: 'Shows avatars of users who reacted to content with reaction count. Great for showing social proof.',
	cards: [
		reactionButtonAvatarsBasicCard,
		reactionButtonAvatarsVariantsCard
	],
	apiDocs: [
		{
			name: 'ReactionButtonAvatars',
			description: 'Component that displays avatars of users who have reacted to an event',
			importPath: "import { ReactionButtonAvatars } from '$lib/registry/components/reaction/displays/avatars'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, uses context if not provided)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show reaction authors for' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Filter by specific emoji' },
				{ name: 'max', type: 'number', default: '3', description: 'Maximum number of avatars to display before showing overflow' },
				{ name: 'avatarSize', type: 'number', default: '24', description: 'Size of each avatar in pixels' },
				{ name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Spacing between avatars' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show total reaction count' },
				{ name: 'onclick', type: '() => void', description: 'Handler called when button is clicked' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};