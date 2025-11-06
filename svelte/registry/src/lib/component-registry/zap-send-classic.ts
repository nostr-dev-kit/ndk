import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

export const zapSendClassicCard: ComponentCardData = {
	name: 'zap-send-classic',
	title: 'ZapSendClassic',
	richDescription: 'Complete zap dialog with amount presets, recipient splits display, and optional comment. Perfect for a traditional zapping experience.',
	command: 'npx jsrepo add zap-send-classic',
	apiDocs: [
		{
			name: 'ZapSendClassic',
			description: 'Full-featured zap sending dialog',
			importPath: "import ZapSendClassic from '$lib/registry/components/zap-send-classic.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'event', type: 'NDKEvent', description: 'Event to zap' },
				{ name: 'user', type: 'NDKUser', description: 'User to zap' },
				{ name: 'open', type: 'boolean', default: 'false', description: 'Controls dialog visibility (bindable)' },
				{ name: 'class', type: 'string', description: 'Custom CSS classes' }
			]
		}
	]
};

export const zapSendClassicApiDocs: ApiDoc[] = [
	{
		name: 'ZapSendClassic',
		description: 'Complete modal dialog for sending zaps with automatic split calculations, amount presets, and comment support.',
		importPath: "import { ZapSendClassic } from '$lib/registry/components/zap-send-classic'",
		props: [
			{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
			{ name: 'event', type: 'NDKEvent', description: 'Event to zap' },
			{ name: 'user', type: 'NDKUser', description: 'User to zap' },
			{ name: 'open', type: 'boolean', default: 'false', description: 'Controls dialog visibility (bindable)' },
			{ name: 'class', type: 'string', description: 'Custom CSS classes' }
		]
	}
];

export const zapSendClassicMetadata = {
	title: 'ZapSendClassic',
	description: 'Complete zap sending dialog with amount selection, automatic split calculations, recipient display, and optional comments.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Full-featured zap dialog for sending sats to events and users.',
	cards: [zapSendClassicCard],
	apiDocs: zapSendClassicApiDocs
};
