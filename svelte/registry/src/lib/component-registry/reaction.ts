import type { ComponentCardData } from '$lib/templates/types';

export const reactionDisplayStandardCard: ComponentCardData = {
	name: 'reaction-display-standard',
	title: 'Reaction.Display - Standard Emojis',
	description: 'Renders standard unicode emojis.',
	richDescription: 'Renders standard unicode emojis with configurable size. Perfect for displaying reaction counts and user reactions.',
	command: 'npx shadcn@latest add reaction',
	apiDocs: []
};

export const reactionDisplayCustomCard: ComponentCardData = {
	name: 'reaction-display-custom',
	title: 'Reaction.Display - Custom Emojis',
	description: 'Renders custom emoji images using NIP-30.',
	richDescription: 'Renders custom emoji images using NIP-30 emoji tags. Automatically handles both standard and custom emojis.',
	command: 'npx shadcn@latest add reaction',
	apiDocs: []
};

export const reactionButtonCard: ComponentCardData = {
	name: 'reaction-button',
	title: 'ReactionButton',
	description: 'Minimal icon-first design.',
	richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside other action buttons. Click to react with a heart.',
	command: 'npx shadcn@latest add reaction-button',
	apiDocs: []
};

export const reactionSlackCard: ComponentCardData = {
	name: 'reaction-slack',
	title: 'ReactionSlack',
	description: 'Slack-style reactions display.',
	richDescription: 'Slack-style reactions with horizontal and vertical layouts. Horizontal shows avatars in popover on hover. Vertical shows avatars inline. Best for displaying all reactions with user attribution.',
	command: 'npx shadcn@latest add reaction-slack',
	apiDocs: []
};

export const reactionEmojiButtonCard: ComponentCardData = {
	name: 'reaction-emoji-button',
	title: 'ReactionEmojiButton',
	description: 'Reaction button with emoji picker.',
	richDescription: 'Reaction button with emoji picker popover. Click to open emoji picker and select from your custom emojis and defaults. Uses bits-ui Popover component.',
	command: 'npx shadcn@latest add reaction-emoji-button',
	apiDocs: []
};

export const reactionActionBasicCard: ComponentCardData = {
	name: 'reaction-action-basic',
	title: 'Basic ReactionAction',
	description: 'Click to react, long-press for picker.',
	richDescription: 'Click to react with a heart, long-press to open emoji picker. Shows current reaction count.',
	command: 'npx shadcn@latest add reaction',
	apiDocs: []
};

export const reactionSlackStyleCard: ComponentCardData = {
	name: 'slack-style',
	title: 'Slack-Style Reactions',
	description: 'Display all reactions with attribution.',
	richDescription: 'Display all reactions sorted by count. Hover to see who reacted with each emoji. Click to add/remove your reaction.',
	command: 'npx shadcn@latest add reaction',
	apiDocs: []
};

export const reactionBuilderCard: ComponentCardData = {
	name: 'builder-usage',
	title: 'Using the Builder',
	description: 'Full control with createReactionAction().',
	richDescription: 'Use createReactionAction() for full control over your UI markup with reactive state management.',
	command: 'npx shadcn@latest add reaction',
	apiDocs: []
};

export const reactionDelayedCard: ComponentCardData = {
	name: 'delayed-reactions',
	title: 'Cancellable Delayed Reactions',
	description: 'Optimistic updates with cancel option.',
	richDescription: 'Set delayed: 5 to show reactions immediately (optimistic update) but wait 5 seconds before publishing. Click again to cancel.',
	command: 'npx shadcn@latest add reaction',
	apiDocs: []
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
	apiDocs: []
};
