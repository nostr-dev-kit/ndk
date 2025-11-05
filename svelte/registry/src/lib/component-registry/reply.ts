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
			importPath: "import { ReplyButton } from '$lib/registry/components'",
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

export const followButtonAvatarsCard: ComponentCardData = {
	name: 'follow-button-avatars',
	title: 'Reply Authors Avatars',
	richDescription: 'Displays a group of avatars representing the authors of replies to an event. Shows up to a configurable number of avatars with an overflow count. Available in ghost, outline, pill, and solid variants.',
	command: 'npx jsrepo add follow-button-avatars',
	apiDocs: [
		{
			name: 'FollowButtonAvatars',
			description: 'Component that displays avatars of users who have replied to an event',
			importPath: "import { FollowButtonAvatars } from '$lib/registry/components'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, uses context if not provided)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show reply authors for' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'max', type: 'number', default: '3', description: 'Maximum number of avatars to display before showing overflow' },
				{ name: 'avatarSize', type: 'number', default: '24', description: 'Size of each avatar in pixels' },
				{ name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Spacing between avatars' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show total reply count' },
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
		replyButtonCard,
		followButtonAvatarsCard
	],
	apiDocs: [
		{
			name: 'ReplyButton',
			description: 'Reply button component showing icon and count. Triggers onclick handler when clicked.',
			importPath: "import { ReplyButton } from '$lib/registry/components'",
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
			importPath: "import { createReplyAction } from '@nostr-dev-kit/svelte'",
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
		},
		{
			name: 'FollowButtonAvatars',
			description: 'Component that displays avatars of users who have replied to an event.',
			importPath: "import { FollowButtonAvatars } from '$lib/registry/components'",
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
					description: 'Event to show reply authors for'
				},
				{
					name: 'variant',
					type: "'ghost' | 'outline' | 'pill' | 'solid'",
					default: "'ghost'",
					description: 'Button style variant'
				},
				{
					name: 'max',
					type: 'number',
					default: '3',
					description: 'Maximum number of avatars to display before showing overflow'
				},
				{
					name: 'avatarSize',
					type: 'number',
					default: '24',
					description: 'Size of each avatar in pixels'
				},
				{
					name: 'spacing',
					type: "'tight' | 'normal' | 'loose'",
					default: "'tight'",
					description: 'Spacing between avatars'
				},
				{
					name: 'showCount',
					type: 'boolean',
					default: 'true',
					description: 'Show total reply count'
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
		}
	]
};
