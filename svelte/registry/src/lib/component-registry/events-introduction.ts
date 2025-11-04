import type { ComponentPageMetadata, ComponentCardData } from '$lib/templates/types';

export const eventsIntroductionMetadata: ComponentPageMetadata = {
	title: 'Event Rendering',
	description: 'The three-layer model: Chrome, Content, and Embeds',
	showcaseTitle: 'Understanding the Architecture',
	showcaseDescription:
		'Events render through three composable layers. Click on any layer to explore how different variants affect the rendering.'
};

export const eventsIntroductionCards: ComponentCardData[] = [
	{
		name: 'chrome-layer',
		title: 'Chrome Layer',
		description: 'The metadata container',
		richDescription:
			'Cards provide the frame around events: avatar, name, timestamp, and action buttons. Different chrome variants offer different layouts.',
		command: 'npx shadcn@latest add event-card',
		apiDocs: []
	},
	{
		name: 'content-layer',
		title: 'Content Layer',
		description: 'The event body renderer',
		richDescription:
			'Content components parse and render event bodies based on kind. They handle markdown, mentions, hashtags, and embedded references.',
		command: 'npx shadcn@latest add event-content',
		apiDocs: []
	},
	{
		name: 'embed-layer',
		title: 'Embed Layer',
		description: 'Referenced entity previews',
		richDescription:
			'When content references other events or entities (via bech32 identifiers), they render as rich previews inside the content.',
		command: 'npx shadcn@latest add embedded-event',
		apiDocs: []
	}
];
