import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const eventCardClassicCard: ComponentCardData = {
	name: 'event-card-classic',
	title: 'EventCardClassic',
	richDescription: 'Use for standard event displays in feeds and lists. Includes background, header with dropdown menu, content, and action buttons (repost, reaction).',
	command: 'npx jsrepo add event-card-classic',
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
	richDescription: 'Fully-styled dropdown menu for event actions including mute, report, copy link, and view raw event. Can be used standalone or within EventCard compositions.',
	command: 'npx jsrepo add event-card-menu',
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
	richDescription: 'Minimal example with EventCard.Root and essential primitives. Build custom layouts by composing EventCard.Header, EventCard.Content, and EventCard.Actions.',
	command: 'npx jsrepo add event-card',
	apiDocs: [
		{
			name: 'EventCard.Root',
			description: 'Root component providing event context to all child primitives',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, falls back to context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'The event to display (any kind)' },
				{ name: 'onclick', type: '(e: MouseEvent) => void', description: 'Click handler (if provided, card becomes interactive)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'EventCard.Header',
			description: 'Displays event author information with avatar, name, and timestamp',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'variant', type: "'full' | 'compact'", default: "'full'", description: 'Header layout variant' },
				{ name: 'avatarSize', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Avatar size' },
				{ name: 'showTimestamp', type: 'boolean', default: 'true', description: 'Show timestamp' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'EventCard.Content',
			description: 'Renders event content with automatic parsing of mentions, hashtags, and media',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const eventCardFullCard: ComponentCardData = {
	name: 'event-card-full',
	title: 'Full Composition',
	richDescription: 'All available primitives composed together with full header, content truncation, and multiple reaction options. Demonstrates the flexibility of the primitive-based approach.',
	command: 'npx jsrepo add event-card',
	apiDocs: [
		{
			name: 'EventCard.Actions',
			description: 'Container for event action buttons (repost, reaction, etc.)',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'EventCard.Dropdown',
			description: 'Dropdown menu for event actions (mute, report, copy, etc.)',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'showRelayInfo', type: 'boolean', default: 'true', description: 'Show relay information in dropdown' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const eventCardChromeCard: ComponentCardData = {
	name: 'event-card-chrome',
	title: 'Interactive Chrome Demo',
	richDescription: 'See how the same chrome adapts to different event kinds. The header, layout, and actions stay consistent while the content changes.',
	command: 'npx jsrepo add event-card',
	apiDocs: [
		{
			name: 'EventCard.Root',
			description: 'Root component providing event context to all child primitives',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, falls back to context)' },
				{ name: 'event', type: 'NDKEvent', required: true, description: 'The event to display (any kind)' },
				{ name: 'onclick', type: '(e: MouseEvent) => void', description: 'Click handler (if provided, card becomes interactive)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const eventCardMetadata: ComponentPageMetadata = {
	title: 'EventCard',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Pre-composed layouts ready to use.'
};

export const eventCardCards = [
	eventCardClassicCard
];
