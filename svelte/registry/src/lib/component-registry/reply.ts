import type { ComponentCardData } from '$lib/templates/types';

export const replyButtonCard: ComponentCardData = {
	name: 'reply-button',
	title: 'Reply Button',
	richDescription: 'A minimal reply button showing icon and count. Handle the click event to open your own composer implementation. Available in ghost, outline, pill, and solid variants.',
	command: 'npx jsrepo add reply-button',
	apiDocs: [
		{
			name: 'ReplyButton',
			description: 'Reply button component showing icon and count',
			importPath: "import { ReplyButton } from '$lib/registry/components/reply/buttons/basic'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, uses context if not provided)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to reply to' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show reply count' },
				{ name: 'onclick', type: '() => void', description: 'Handler called when button is clicked' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const replyMetadata = {
	title: 'Reply',
	showcaseTitle: 'Variants',
	showcaseDescription: 'Reply button variants for different design needs.',
	cards: [
		replyButtonCard
	],
	apiDocs: [
		{
			name: 'ReplyButton',
			description: 'Reply button component showing icon and count. Triggers onclick handler when clicked.',
			importPath: "import { ReplyButton } from '$lib/registry/components/reply/buttons/basic'",
			props: [
				{
					name: 'ndk',
					type: 'NDKSvelte',
					description: 'NDK instance (optional, uses context if not provided)'
				},
				{
					name: 'event',
					type: 'NDKEvent',
					required: true,
					description: 'Event to reply to'
				},
				{
					name: 'variant',
					type: "'ghost' | 'outline' | 'pill' | 'solid'",
					default: "'ghost'",
					description: 'Button style variant'
				},
				{
					name: 'showCount',
					type: 'boolean',
					default: 'true',
					description: 'Show reply count'
				},
				{
					name: 'onclick',
					type: '() => void',
					description: 'Handler called when button is clicked'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'createReplyAction',
			description: 'Builder function that provides reactive reply state and methods. Returns ReplyActionState with count (number), hasReplied (boolean), and reply(content) function that publishes a reply.',
			importPath: "import { createReplyAction } from '$lib/registry/builders/reply-action.svelte.js'",
			props: [
				{
					name: 'config',
					type: '() => { event: NDKEvent }',
					required: true,
					description: 'Reactive function returning the event to reply to'
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
