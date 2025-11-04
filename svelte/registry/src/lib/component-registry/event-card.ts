import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const eventCardClassicCard: ComponentCardData = {
	name: 'event-card-classic',
	title: 'EventCardClassic',
	description: 'Standard event display for feeds.',
	richDescription: 'Use for standard event displays in feeds and lists. Includes background, header with dropdown menu, content, and action buttons (repost, reaction).',
	command: 'npx shadcn@latest add event-card-classic',
	apiDocs: [
		{
			name: 'EventCardClassic',
			description: 'Pre-composed event card with complete functionality including background, dropdown menu, and all action buttons.',
			importPath: "import EventCardClassic from '$lib/registry/components/event-card/event-card-classic.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'event', type: 'NDKEvent', description: 'The event to display', required: true },
				{ name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
				{ name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable' },
				{ name: 'showActions', type: 'boolean', default: 'true', description: 'Show action buttons (repost, reaction)' },
				{ name: 'showDropdown', type: 'boolean', default: 'true', description: 'Show dropdown menu' },
				{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const eventCardMenuCard: ComponentCardData = {
	name: 'event-card-menu',
	title: 'EventCardMenu',
	description: 'Dropdown menu with event actions.',
	richDescription: 'Use for dropdown menus with event actions (mute, report, copy, view raw). Can be placed in any EventCard.Header.',
	command: 'npx shadcn@latest add event-card-menu',
	apiDocs: [
		{
			name: 'EventCardMenu',
			description: 'Fully-styled dropdown menu for event actions including mute, report, copy, and raw event viewing.',
			importPath: "import EventCardMenu from '$lib/registry/components/event-card/event-card-menu.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'event', type: 'NDKEvent', description: 'The event for this menu', required: true },
				{ name: 'showRelayInfo', type: 'boolean', default: 'true', description: 'Show relay information in dropdown' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const eventCardBasicCard: ComponentCardData = {
	name: 'event-card-basic',
	title: 'Basic Usage',
	description: 'Minimal example with EventCard primitives.',
	richDescription: 'Minimal example with EventCard.Root and essential primitives. Build custom layouts by composing EventCard.Header, EventCard.Content, and EventCard.Actions.',
	command: 'npx shadcn@latest add event-card',
	apiDocs: []
};

export const eventCardFullCard: ComponentCardData = {
	name: 'event-card-full',
	title: 'Full Composition',
	description: 'All available primitives composed together.',
	richDescription: 'All available primitives composed together with full header, content truncation, and multiple reaction options. Demonstrates the flexibility of the primitive-based approach.',
	command: 'npx shadcn@latest add event-card',
	apiDocs: []
};

export const eventCardChromeCard: ComponentCardData = {
	name: 'event-card-chrome',
	title: 'Interactive Chrome Demo',
	description: 'See how the chrome adapts to different event kinds.',
	richDescription: 'See how the same chrome adapts to different event kinds. The header, layout, and actions stay consistent while the content changes.',
	command: 'npx shadcn@latest add event-card',
	apiDocs: []
};

export const eventCardMetadata: ComponentPageMetadata = {
	title: 'EventCard',
	description: 'Composable components for displaying any NDKEvent type with flexible layouts and interactions. Perfect for feeds, threads, and social content.',
	showcaseTitle: 'Blocks',
	showcaseDescription: 'Pre-composed layouts ready to use.'
};

export const eventCardCards = [
	eventCardClassicCard,
	eventCardMenuCard,
	eventCardBasicCard,
	eventCardFullCard
];
