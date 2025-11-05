import type { ComponentCardData } from '$lib/templates/types';

export const reactionDisplayStandardCard: ComponentCardData = {
	name: 'reaction-display-standard',
	title: 'Reaction.Display - Standard Emojis',
	description: 'Renders standard unicode emojis.',
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
	description: 'Renders custom emoji images using NIP-30.',
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
	description: 'Minimal icon-first design.',
	richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside other action buttons. Click to react with a heart.',
	command: 'npx jsrepo add reaction-button',
	apiDocs: [
		{
			name: 'ReactionButton',
			description: 'Minimal reaction button with icon and count',
			importPath: "import { ReactionButton } from '$lib/registry/components'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to react to' },
				{ name: 'emoji', type: 'string', default: "'❤️'", description: 'Emoji to use for reaction' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const reactionSlackCard: ComponentCardData = {
	name: 'reaction-slack',
	title: 'ReactionSlack',
	description: 'Slack-style reactions display.',
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
	description: 'Reaction button with emoji picker.',
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
	description: 'Click to react, long-press for picker.',
	richDescription: 'Click to react with a heart, long-press to open emoji picker. Shows current reaction count.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'createReactionAction',
			description: 'Builder function that provides reactive reaction state and methods. Returns ReactionActionState with: reactions (Map<string, Set<string>> - emoji to pubkeys), hasReacted (boolean), userReaction (string | null - emoji user reacted with), totalCount (number), react(emoji: string), unreact(), and toggle(emoji: string).',
			importPath: "import { createReactionAction } from '@nostr-dev-kit/svelte'",
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
	description: 'Display all reactions with attribution.',
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
	description: 'Full control with createReactionAction().',
	richDescription: 'Use createReactionAction() for full control over your UI markup with reactive state management.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'createReactionAction',
			description: 'Builder function that provides reactive reaction state and methods. Returns ReactionActionState with: reactions (Map<string, Set<string>> - emoji to pubkeys), hasReacted (boolean), userReaction (string | null - emoji user reacted with), totalCount (number), react(emoji: string), unreact(), and toggle(emoji: string).',
			importPath: "import { createReactionAction } from '@nostr-dev-kit/svelte'",
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
	description: 'Optimistic updates with cancel option.',
	richDescription: 'Set delayed: 5 to show reactions immediately (optimistic update) but wait 5 seconds before publishing. Click again to cancel.',
	command: 'npx jsrepo add reaction',
	apiDocs: [
		{
			name: 'createReactionAction',
			description: 'Builder function with delayed reaction support',
			importPath: "import { createReactionAction } from '@nostr-dev-kit/svelte'",
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
	description: 'Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support. Long-press to open emoji picker with custom emojis from your NIP-51 kind:10030 list.',
	showcaseTitle: 'Reaction Primitives',
	showcaseDescription: 'Low-level building blocks for rendering emoji reactions.',
	cards: [
		reactionDisplayStandardCard,
		reactionDisplayCustomCard,
		reactionButtonCard,
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
			importPath: "import { createReactionAction } from '@nostr-dev-kit/svelte'",
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
