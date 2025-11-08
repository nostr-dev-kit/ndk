import type { ComponentCardData } from '$lib/templates/types';

export const reactionEmojiButtonBasicCard: ComponentCardData = {
	name: 'reaction-emoji-button-basic',
	title: 'Reaction Emoji Button',
	richDescription: 'Reaction button with emoji picker popover on hover. Click to open emoji picker and select from your custom emojis and defaults.',
	command: 'npx jsrepo add reaction-emoji-button',
	apiDocs: [
		{
			name: 'ReactionEmojiButton',
			description: 'Reaction button with emoji picker popover',
			importPath: "import { ReactionEmojiButton } from '$lib/registry/components/reaction-emoji-button'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to react to' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' },
				{ name: 'children', type: 'Snippet', description: 'Custom trigger content (optional)' }
			]
		}
	]
};

export const reactionEmojiButtonCustomTriggerCard: ComponentCardData = {
	name: 'reaction-emoji-button-custom',
	title: 'Custom Trigger',
	richDescription: 'Use custom children as the trigger instead of the default reaction button.',
	command: 'npx jsrepo add reaction-emoji-button',
	apiDocs: [
		{
			name: 'ReactionEmojiButton',
			description: 'Reaction button with emoji picker popover',
			importPath: "import { ReactionEmojiButton } from '$lib/registry/components/reaction-emoji-button'",
			props: [
				{ name: 'children', type: 'Snippet', description: 'Custom trigger content to replace default button' }
			]
		}
	]
};

export const reactionEmojiButtonMetadata = {
	title: 'Reaction Emoji Button',
	showcaseTitle: 'Reaction with Emoji Picker',
	showcaseDescription: 'Reaction button that opens an emoji picker on hover. Better for desktop interfaces.',
	cards: [
		reactionEmojiButtonBasicCard,
		reactionEmojiButtonCustomTriggerCard
	],
	apiDocs: [
		{
			name: 'ReactionEmojiButton',
			description: 'Reaction button with emoji picker popover',
			importPath: "import { ReactionEmojiButton } from '$lib/registry/components/reaction-emoji-button'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to react to' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' },
				{ name: 'children', type: 'Snippet', description: 'Custom trigger content (optional)' }
			]
		}
	]
};