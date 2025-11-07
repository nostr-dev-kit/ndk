import type { ComponentCardData } from '$lib/templates/types';

export const repostButtonCard: ComponentCardData = {
	name: 'repost-button',
	title: 'RepostButton',
	richDescription: 'Clean, minimal repost button with icon and count. Perfect for action bars and compact layouts.',
	command: 'npx jsrepo add repost-button',
	apiDocs: [
		{
			name: 'RepostButton',
			description: 'Minimal repost button component',
			importPath: "import RepostButton from '$lib/registry/components/repost-button.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to repost' },
				{ name: 'class', type: 'string', description: 'Custom CSS classes' }
			]
		}
	]
};

export const repostButtonAvatarsCard: ComponentCardData = {
	name: 'repost-button-avatars',
	title: 'Repost Authors Avatars',
	richDescription: 'Displays a group of avatars representing users who have reposted an event. Shows up to a configurable number of avatars with an overflow count. Available in ghost, outline, pill, and solid variants.',
	command: 'npx jsrepo add repost-button-avatars',
	apiDocs: [
		{
			name: 'RepostButtonAvatars',
			description: 'Component that displays avatars of users who have reposted an event',
			importPath: "import { RepostButtonAvatars } from '$lib/registry/components/repost-button-avatars'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, uses context if not provided)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to show repost authors for' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'max', type: 'number', default: '3', description: 'Maximum number of avatars to display before showing overflow' },
				{ name: 'avatarSize', type: 'number', default: '24', description: 'Size of each avatar in pixels' },
				{ name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Spacing between avatars' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show total repost count' },
				{ name: 'onclick', type: '() => void', description: 'Handler called when button is clicked' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const repostButtonPillCard: ComponentCardData = {
	name: 'repost-button-pill',
	title: 'RepostButtonPill',
	richDescription: 'Pill-style button with rounded background. Great for standalone repost actions. Available in solid and outline variants.',
	command: 'npx jsrepo add repost-button-pill',
	apiDocs: [
		{
			name: 'RepostButtonPill',
			description: 'Pill-style repost button component',
			importPath: "import RepostButtonPill from '$lib/registry/components/repost-button-pill.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Event to repost' },
				{ name: 'variant', type: "'solid' | 'outline'", default: "'solid'", description: 'Button style variant' },
				{ name: 'class', type: 'string', description: 'Custom CSS classes' }
			]
		}
	]
};

export const repostBasicBuilderCard: ComponentCardData = {
	name: 'repost-basic-builder',
	title: 'Minimal Builder Example',
	richDescription: 'Simplest possible implementation using the createRepostAction builder. Perfect starting point for custom buttons.',
	command: 'npx jsrepo add repost-button',
	apiDocs: [
		{
			name: 'createRepostAction',
			description: 'Builder function that provides repost state and methods. Returns RepostActionState with count (number), hasReposted (boolean), and repost() function.',
			importPath: "import { createRepostAction } from '$lib/registry/builders/repost-action.svelte.js'",
			props: [
				{
					name: 'getter',
					type: '() => { event: NDKEvent }',
					required: true,
					description: 'Function that returns the event to repost'
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

export const repostCustomBuilderCard: ComponentCardData = {
	name: 'repost-custom-builder',
	title: 'Custom Styled Button',
	richDescription: 'Build your own repost button with custom styling and layout using the createRepostAction builder.',
	command: 'npx jsrepo add repost-button',
	apiDocs: [
		{
			name: 'createRepostAction',
			description: 'Builder function that provides repost state and methods. Returns RepostActionState with count (number), hasReposted (boolean), and repost() function.',
			importPath: "import { createRepostAction } from '$lib/registry/builders/repost-action.svelte.js'",
			props: [
				{
					name: 'getter',
					type: '() => { event: NDKEvent }',
					required: true,
					description: 'Function that returns the event to repost'
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

export const repostMetadata = {
	title: 'Repost',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Repost button variants from minimal to custom implementations.',
	cards: [
		repostButtonCard,
		repostButtonAvatarsCard,
		repostButtonPillCard,
		repostBasicBuilderCard,
		repostCustomBuilderCard
	],
	apiDocs: [
		{
			name: 'createRepostAction',
			description: 'Builder function that provides repost state and methods. Returns RepostActionState with count (number), hasReposted (boolean), and repost() function.',
			importPath: "import { createRepostAction } from '$lib/registry/builders/repost-action.svelte.js'",
			props: [
				{
					name: 'getter',
					type: '() => { event: NDKEvent }',
					required: true,
					description: 'Function that returns the event to repost'
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
