import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const fullCardData: ComponentCardData = {
	name: 'card-full',
	title: 'Full Card with Chrome',
	description: 'Complete social media post experience.',
	richDescription: 'EventCard with header, content, and actions — the complete social media post experience.',
	command: 'npx shadcn@latest add event-card',
	apiDocs: []
};

export const contentOnlyData: ComponentCardData = {
	name: 'content-only',
	title: 'Content Only (No Chrome)',
	description: 'Just the content renderer without frame.',
	richDescription: 'Just the content renderer without any frame — useful for article pages or focused reading.',
	command: 'npx shadcn@latest add event-content',
	apiDocs: []
};

export const customChromeData: ComponentCardData = {
	name: 'custom-chrome',
	title: 'Custom Chrome',
	description: 'Mix and match card primitives.',
	richDescription: "Mix and match — use the card's frame but customize the layout or add your own elements.",
	command: 'npx shadcn@latest add event-card',
	apiDocs: []
};

export const cardIntroductionMetadata: ComponentPageMetadata = {
	title: 'Card Components',
	description: 'Understanding the chrome: consistent visual frames for Nostr events',
	showcaseTitle: 'Understanding the Pattern',
	showcaseDescription: 'See how cards and content work together.'
};

export const cardIntroductionCards = [fullCardData, contentOnlyData, customChromeData];
