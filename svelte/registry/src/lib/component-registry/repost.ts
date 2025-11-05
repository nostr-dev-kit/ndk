import type { ComponentCardData } from '$lib/templates/types';

export const repostButtonCard: ComponentCardData = {
	name: 'repost-button',
	title: 'RepostButton',
	description: 'Clean, minimal repost button.',
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

export const repostButtonPillCard: ComponentCardData = {
	name: 'repost-button-pill',
	title: 'RepostButtonPill',
	description: 'Pill-style repost button.',
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
	description: 'Simplest builder implementation.',
	richDescription: 'Simplest possible implementation using the createRepostAction builder. Perfect starting point for custom buttons.',
	command: 'npx jsrepo add repost-button',
	apiDocs: [
		{
			name: 'createRepostAction',
			description: 'Builder function that provides repost state and methods. Returns RepostActionState with count (number), hasReposted (boolean), and repost() function.',
			importPath: "import { createRepostAction } from '@nostr-dev-kit/svelte'",
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
	description: 'Custom styled repost button.',
	richDescription: 'Build your own repost button with custom styling and layout using the createRepostAction builder.',
	command: 'npx jsrepo add repost-button',
	apiDocs: [
		{
			name: 'createRepostAction',
			description: 'Builder function that provides repost state and methods. Returns RepostActionState with count (number), hasReposted (boolean), and repost() function.',
			importPath: "import { createRepostAction } from '@nostr-dev-kit/svelte'",
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
	description: 'Repost button blocks and builder for adding repost functionality to Nostr events. Tracks both regular reposts (Kind 6/16) and quote posts.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Repost button variants from minimal to custom implementations.',
	cards: [
		repostButtonCard,
		repostButtonPillCard,
		repostBasicBuilderCard,
		repostCustomBuilderCard
	],
	apiDocs: [
		{
			name: 'createRepostAction',
			description: 'Builder function that provides repost state and methods. Returns RepostActionState with count (number), hasReposted (boolean), and repost() function.',
			importPath: "import { createRepostAction } from '@nostr-dev-kit/svelte'",
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
