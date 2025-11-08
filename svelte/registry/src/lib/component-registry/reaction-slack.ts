import type { ComponentCardData } from '$lib/templates/types';

export const reactionSlackHorizontalCard: ComponentCardData = {
	name: 'reaction-slack-horizontal',
	title: 'Slack-Style Horizontal',
	richDescription: 'Slack-style reactions with horizontal layout. Shows all reactions sorted by count. Hover to see who reacted (avatars in popover). Click to add/remove your reaction.',
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

export const reactionSlackVerticalCard: ComponentCardData = {
	name: 'reaction-slack-vertical',
	title: 'Slack-Style Vertical',
	richDescription: 'Slack-style reactions with vertical layout. Shows all reactions with inline avatar groups. Best for detailed reaction displays.',
	command: 'npx jsrepo add reaction-slack',
	apiDocs: [
		{
			name: 'ReactionSlack',
			description: 'Slack-style reaction display with user attribution',
			importPath: "import { ReactionSlack } from '$lib/registry/components/reaction-slack'",
			props: [
				{ name: 'layout', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction (horizontal shows avatars in popover, vertical shows inline)' }
			]
		}
	]
};

export const reactionSlackMetadata = {
	title: 'Reaction Slack',
	showcaseTitle: 'Slack-Style Reactions',
	showcaseDescription: 'Display all reactions on an event in a Slack-like format with user attribution.',
	cards: [
		reactionSlackHorizontalCard,
		reactionSlackVerticalCard
	],
	apiDocs: [
		{
			name: 'ReactionSlack',
			description: 'Slack-style reaction display with user attribution',
			importPath: "import { ReactionSlack } from '$lib/registry/components/reaction-slack'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show reactions for' },
				{ name: 'layout', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction (horizontal shows avatars in popover, vertical shows inline)' },
				{ name: 'showAvatars', type: 'boolean', default: 'true', description: 'Show user avatars' },
				{ name: 'delayed', type: 'number', description: 'Delay in seconds before publishing (for cancellable reactions)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};