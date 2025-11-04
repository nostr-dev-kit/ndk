import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const voiceMessageCardCompactCard: ComponentCardData = {
	name: 'voice-message-card-compact',
	title: 'Compact',
	description: 'Inline voice message display.',
	richDescription: 'Use for inline voice message display in feeds or chat interfaces.',
	command: 'npx shadcn@latest add voice-message-card-compact',
	apiDocs: []
};

export const voiceMessageCardExpandedCard: ComponentCardData = {
	name: 'voice-message-card-expanded',
	title: 'Expanded',
	description: 'Detailed display with waveform.',
	richDescription: 'Use for detailed voice message display with waveform visualization.',
	command: 'npx shadcn@latest add voice-message-card-expanded',
	apiDocs: []
};

export const voiceMessageCardBasicCard: ComponentCardData = {
	name: 'voice-message-basic',
	title: 'Basic Usage',
	description: 'Minimal primitives example.',
	richDescription: 'Minimal example with VoiceMessageCard.Root and player primitive.',
	command: 'npx shadcn@latest add voice-message-card',
	apiDocs: []
};

export const voiceMessageCardCompositionCard: ComponentCardData = {
	name: 'voice-message-composition',
	title: 'Full Composition',
	description: 'All primitives composed together.',
	richDescription: 'All available primitives composed together.',
	command: 'npx shadcn@latest add voice-message-card',
	apiDocs: []
};

export const voiceMessageCardMetadata: ComponentPageMetadata = {
	title: 'VoiceMessage',
	description: 'Composable voice message card components for displaying NIP-A0 voice messages with audio playback and waveform visualization.',
	showcaseTitle: 'Blocks',
	showcaseDescription: 'Pre-composed layouts ready to use.'
};

export const voiceMessageCardCards = [
	voiceMessageCardCompactCard,
	voiceMessageCardExpandedCard,
	voiceMessageCardBasicCard,
	voiceMessageCardCompositionCard
];
