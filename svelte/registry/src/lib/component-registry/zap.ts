import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for zap variants
export const zapButtonCard: ComponentCardData = {
	name: 'zap-button',
	title: 'ZapButton',
	richDescription: 'Clean, minimal zap button with lightning icon and sat count. Perfect for action bars and compact layouts.',
	command: 'npx jsrepo add zap-button',
	apiDocs: [
		{
			name: 'ZapButton',
			description: 'Minimal zap button component',
			importPath: "import ZapButton from '$lib/registry/components/zap-button.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', description: 'Event to zap' },
				{ name: 'user', type: 'NDKUser', description: 'User to zap' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'amount', type: 'number', default: '1000', description: 'Default zap amount in sats' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show sat count' },
				{ name: 'class', type: 'string', description: 'Custom CSS classes' }
			]
		}
	]
};

export const zapButtonAvatarsCard: ComponentCardData = {
	name: 'zap-button-avatars',
	title: 'ZapButtonAvatars',
	richDescription: 'Show avatars of users who zapped with total sat count. Great for displaying social proof.',
	command: 'npx jsrepo add zap-button-avatars',
	apiDocs: [
		{
			name: 'ZapButtonAvatars',
			description: 'Zap button with zapper avatars',
			importPath: "import ZapButtonAvatars from '$lib/registry/components/zap-button-avatars.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', description: 'Event to zap' },
				{ name: 'user', type: 'NDKUser', description: 'User to zap' },
				{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
				{ name: 'max', type: 'number', default: '3', description: 'Maximum avatars to show' },
				{ name: 'avatarSize', type: 'number', default: '24', description: 'Avatar size in pixels' },
				{ name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Avatar spacing' },
				{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show sat count' },
				{ name: 'class', type: 'string', description: 'Custom CSS classes' }
			]
		}
	]
};

// API documentation
export const zapApiDocs: ApiDoc[] = [
	{
		name: 'ZapButton',
		description: 'Pre-built zap button component with automatic amount tracking and variant support.',
		importPath: "import { ZapButton } from '$lib/registry/components/zap/buttons/basic'",
		props: [
			{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
			{ name: 'event', type: 'NDKEvent', description: 'Event to zap' },
			{ name: 'user', type: 'NDKUser', description: 'User to zap' },
			{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
			{ name: 'amount', type: 'number', default: '1000', description: 'Default zap amount in sats' },
			{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show sat count' },
			{ name: 'class', type: 'string', description: 'Custom CSS classes' }
		]
	},
	{
		name: 'ZapButtonAvatars',
		description: 'Zap button showing avatars of zappers with total sat count.',
		importPath: "import { ZapButtonAvatars } from '$lib/registry/components/zap/buttons/avatars'",
		props: [
			{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
			{ name: 'event', type: 'NDKEvent', description: 'Event to zap' },
			{ name: 'user', type: 'NDKUser', description: 'User to zap' },
			{ name: 'variant', type: "'ghost' | 'outline' | 'pill' | 'solid'", default: "'ghost'", description: 'Button style variant' },
			{ name: 'max', type: 'number', default: '3', description: 'Maximum avatars to show' },
			{ name: 'avatarSize', type: 'number', default: '24', description: 'Avatar size in pixels' },
			{ name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Avatar spacing' },
			{ name: 'showCount', type: 'boolean', default: 'true', description: 'Show sat count' },
			{ name: 'class', type: 'string', description: 'Custom CSS classes' }
		]
	}
];

// All metadata for the zap page
export const zapMetadata = {
	title: 'Zap',
	description: 'Zap (lightning payment) button with amount display. Send sats to support events and users on Nostr.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Zap button variants from minimal to custom implementations.',
	cards: [zapButtonCard, zapButtonAvatarsCard],
	apiDocs: zapApiDocs
};
