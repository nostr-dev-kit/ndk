import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const voiceMessageCardCompactCard: ComponentCardData = {
	name: 'voice-message-card-compact',
	title: 'Compact',
	richDescription: 'Use for inline voice message display in feeds or chat interfaces.',
	command: 'npx jsrepo add voice-message-card-compact',
	apiDocs: [
		{
			name: 'VoiceMessageCardCompact',
			description: 'Compact voice message card for inline display',
			importPath: "import { VoiceMessageCardCompact } from '$lib/registry/components/voice-message/cards/basic'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Voice message event (NIP-A0)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const voiceMessageCardExpandedCard: ComponentCardData = {
	name: 'voice-message-card-expanded',
	title: 'Expanded',
	richDescription: 'Use for detailed voice message display with waveform visualization.',
	command: 'npx jsrepo add voice-message-card-expanded',
	apiDocs: [
		{
			name: 'VoiceMessageCardExpanded',
			description: 'Expanded voice message card with waveform visualization',
			importPath: "import { VoiceMessageCardExpanded } from '$lib/registry/components/voice-message/cards/basic'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Voice message event (NIP-A0)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const voiceMessageCardBasicCard: ComponentCardData = {
	name: 'voice-message-basic',
	title: 'Basic Usage',
	richDescription: 'Minimal example with VoiceMessageCard.Root and player primitive.',
	command: 'npx jsrepo add voice-message-card',
	apiDocs: [
		{
			name: 'VoiceMessage.Root',
			description: 'Root component providing voice message context to all child primitives',
			importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'Voice message event (NIP-A0)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'VoiceMessage.Player',
			description: 'Audio player primitive with play/pause controls and progress bar',
			importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const voiceMessageCardCompositionCard: ComponentCardData = {
	name: 'voice-message-composition',
	title: 'Full Composition',
	richDescription: 'All available primitives composed together.',
	command: 'npx jsrepo add voice-message-card',
	apiDocs: [
		{
			name: 'VoiceMessage.Waveform',
			description: 'Waveform visualization primitive',
			importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'VoiceMessage.Duration',
			description: 'Displays voice message duration',
			importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const voiceMessageCardMetadata: ComponentPageMetadata = {
	title: 'VoiceMessage',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Pre-composed layouts ready to use.'
};

export const voiceMessageCardCards = [
	voiceMessageCardCompactCard,
	voiceMessageCardExpandedCard,
	voiceMessageCardBasicCard,
	voiceMessageCardCompositionCard
];
