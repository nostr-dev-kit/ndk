import type { ComponentCardData } from '$lib/templates/types';

export const reactionBasicCard: ComponentCardData = {
	name: 'reaction-basic',
	title: 'Reaction with Long-Press',
	richDescription: 'Click to react with a heart, long-press to open emoji picker. Shows current reaction count. Perfect for mobile interfaces.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'Reaction',
			description: 'Reaction button with long-press emoji picker',
			importPath: "import { Reaction } from '$lib/registry/components/reaction'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if used in EventCard context)' },
				{ name: 'event', type: 'NDKEvent', description: 'Event to react to (optional if used in EventCard context)' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Default emoji to show' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Whether to show reaction count' },
				{ name: 'longPressDuration', type: 'number', default: '500', description: 'Long press duration in milliseconds' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionDelayedCard: ComponentCardData = {
	name: 'reaction-delayed',
	title: 'Cancellable Delayed Reactions',
	richDescription: 'Set delayed: 5 to show reactions immediately (optimistic update) but wait 5 seconds before publishing. Click again to cancel.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'Reaction',
			description: 'Reaction button with delayed publishing support',
			importPath: "import { Reaction } from '$lib/registry/components/reaction'",
			props: [
				{ name: 'delayed', type: 'number', description: 'Delay in seconds before publishing (for cancellable reactions)' }
			]
		}
	]
};

export const reactionBuilderCard: ComponentCardData = {
	name: 'reaction-builder',
	title: 'Using the Reaction Builder',
	richDescription: 'Use createReactionAction() for full control over your UI markup with reactive state management.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'createReactionAction',
			description: 'Builder function that provides reactive reaction state and methods',
			importPath: "import { createReactionAction } from '$lib/registry/builders/reaction-action.svelte.js'",
			props: [
				{
					name: 'config',
					type: '() => { event: NDKEvent, delayed?: number }',
					required: true,
					description: 'Reactive function returning event and optional delay in seconds for cancellable reactions'
				},
				{
					name: 'ndk',
					type: 'NDKSvelte',
					required: true,
					description: 'NDK instance'
				}
			]
		}
	]
};

export const reactionMetadata = {
	title: 'Reaction',
	showcaseTitle: 'Reaction with Long-Press',
	showcaseDescription: 'Sophisticated reaction component with long-press emoji picker. Great for mobile interfaces.',
	cards: [
		reactionBasicCard,
		reactionDelayedCard,
		reactionBuilderCard
	],
	apiDocs: [
		{
			name: 'Reaction',
			description: 'Reaction button with long-press emoji picker',
			importPath: "import { Reaction } from '$lib/registry/components/reaction'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if used in EventCard context)' },
				{ name: 'event', type: 'NDKEvent', description: 'Event to react to (optional if used in EventCard context)' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Default emoji to show' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Whether to show reaction count' },
				{ name: 'longPressDuration', type: 'number', default: '500', description: 'Long press duration in milliseconds' },
				{ name: 'delayed', type: 'number', description: 'Delay in seconds before publishing (for cancellable reactions)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'createReactionAction',
			description: 'Builder function that provides reactive reaction state and methods. Returns ReactionActionState with: reactions (Map<string, Set<string>> - emoji to pubkeys), hasReacted (boolean), userReaction (string | null - emoji user reacted with), totalCount (number), react(emoji: string), unreact(), and toggle(emoji: string).',
			importPath: "import { createReactionAction } from '$lib/registry/builders/reaction-action.svelte.js'",
			props: [
				{
					name: 'config',
					type: '() => { event: NDKEvent, delayed?: number }',
					required: true,
					description: 'Reactive function returning event and optional delay in seconds for cancellable reactions'
				},
				{
					name: 'ndk',
					type: 'NDKSvelte',
					required: true,
					description: 'NDK instance'
				}
			]
		}
	]
};