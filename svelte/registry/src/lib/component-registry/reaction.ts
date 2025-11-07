import type { ComponentCardData } from '$lib/templates/types';

export const reactionDisplayStandardCard: ComponentCardData = {
	name: 'reaction-display-standard',
	title: 'Reaction.Display - Standard Emojis',
	richDescription: 'Renders standard unicode emojis with configurable size. Perfect for displaying reaction counts and user reactions.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'Reaction.Display',
			description: 'Primitive for rendering emoji reactions (both standard and custom)',
			importPath: "import { Reaction } from '$lib/registry/ui/reaction'",
			props: [
				{ name: 'emoji', type: 'string', required: true, description: 'Emoji content (unicode or custom emoji shortcode)' },
				{ name: 'size', type: 'number', default: '20', description: 'Emoji size in pixels' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionDisplayCustomCard: ComponentCardData = {
	name: 'reaction-display-custom',
	title: 'Reaction.Display - Custom Emojis',
	richDescription: 'Renders custom emoji images using NIP-30 emoji tags. Automatically handles both standard and custom emojis.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'Reaction.Display',
			description: 'Primitive for rendering emoji reactions (both standard and custom)',
			importPath: "import { Reaction } from '$lib/registry/ui/reaction'",
			props: [
				{ name: 'emoji', type: 'string', required: true, description: 'Emoji content (unicode or custom emoji shortcode)' },
				{ name: 'url', type: 'string', description: 'URL for custom emoji image' },
				{ name: 'shortcode', type: 'string', description: 'Shortcode for custom emoji' },
				{ name: 'size', type: 'number', default: '20', description: 'Emoji size in pixels' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionButtonCard: ComponentCardData = {
	name: 'reaction-button',
	title: 'ReactionButton',
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
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionButtonAvatarsCard: ComponentCardData = {
	name: 'reaction-button-avatars',
	title: 'Reaction Authors Avatars',
	richDescription: 'Displays a group of avatars representing the authors of reactions to an event. Shows up to a configurable number of avatars with an overflow count. Available in ghost, outline, pill, and solid variants.',
	command: 'npx jsrepo add reaction-button-avatars',
	apiDocs: [
		{
			name: 'ReactionButtonAvatars',
			description: 'Component that displays avatars of users who have reacted to an event',
			importPath: "import { ReactionButtonAvatars } from '$lib/registry/components/reaction-button-avatars'",
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

export const reactionSlackCard: ComponentCardData = {
	name: 'reaction-slack',
	title: 'ReactionSlack',
	richDescription: 'Slack-style reactions with horizontal and vertical layouts. Horizontal shows avatars in popover on hover. Vertical shows avatars inline. Best for displaying all reactions with user attribution.',
	command: 'npx jsrepo add reaction-slack',
	apiDocs: [
		{
			name: 'ReactionSlack',
			description: 'Slack-style reaction display with user attribution',
			importPath: "import { ReactionSlack } from '$lib/registry/components/reaction-slack'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show reactions for' },
				{ name: 'layout', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction (horizontal shows avatars in popover, vertical shows inline)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionEmojiButtonCard: ComponentCardData = {
	name: 'reaction-emoji-button',
	title: 'ReactionEmojiButton',
	richDescription: 'Reaction button with emoji picker popover. Click to open emoji picker and select from your custom emojis and defaults. Uses bits-ui Popover component.',
	command: 'npx jsrepo add reaction-emoji-button',
	apiDocs: [
		{
			name: 'ReactionEmojiButton',
			description: 'Reaction button with emoji picker popover',
			importPath: "import { ReactionEmojiButton } from '$lib/registry/components/reaction-emoji-button'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to react to' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionActionBasicCard: ComponentCardData = {
	name: 'reaction-action-basic',
	title: 'Basic ReactionAction',
	richDescription: 'Click to react with a heart, long-press to open emoji picker. Shows current reaction count.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
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

export const reactionSlackStyleCard: ComponentCardData = {
	name: 'slack-style',
	title: 'Slack-Style Reactions',
	richDescription: 'Display all reactions sorted by count. Hover to see who reacted with each emoji. Click to add/remove your reaction.',
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

export const reactionBuilderCard: ComponentCardData = {
	name: 'builder-usage',
	title: 'Using the Builder',
	richDescription: 'Use createReactionAction() for full control over your UI markup with reactive state management.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
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

export const reactionDelayedCard: ComponentCardData = {
	name: 'delayed-reactions',
	title: 'Cancellable Delayed Reactions',
	richDescription: 'Set delayed: 5 to show reactions immediately (optimistic update) but wait 5 seconds before publishing. Click again to cancel.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'createReactionAction',
			description: 'Builder function with delayed reaction support',
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
	showcaseTitle: 'Reaction Primitives',
	showcaseDescription: 'Low-level building blocks for rendering emoji reactions.',
	cards: [
		reactionDisplayStandardCard,
		reactionDisplayCustomCard,
		reactionButtonCard,
		reactionButtonAvatarsCard,
		reactionSlackCard,
		reactionEmojiButtonCard,
		reactionActionBasicCard,
		reactionSlackStyleCard,
		reactionBuilderCard,
		reactionDelayedCard
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
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'ReactionSlack',
			description: 'Slack-style reaction display with user attribution',
			importPath: "import { ReactionSlack } from '$lib/registry/components/reaction-slack'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show reactions for' },
				{ name: 'variant', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout variant (horizontal shows avatars in tooltip, vertical shows inline)' },
				{ name: 'showAvatars', type: 'boolean', default: 'true', description: 'Show user avatars' },
				{ name: 'delayed', type: 'number', description: 'Delay in seconds before publishing (for cancellable reactions)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
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
