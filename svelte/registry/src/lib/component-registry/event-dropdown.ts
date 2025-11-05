import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const eventDropdownCard: ComponentCardData = {
	name: 'event-dropdown',
	title: 'EventDropdown',
	description: 'Dropdown menu for event actions.',
	richDescription: 'Fully-styled dropdown menu with event actions including mute, report, copy ID, copy author, view raw event, and relay information. Perfect for event card menus and context actions.',
	command: 'npx shadcn@latest add event-dropdown',
	apiDocs: [
		{
			name: 'EventDropdown',
			description: 'Fully-styled dropdown menu for event actions including mute, report, copy, and raw event viewing.',
			importPath: "import EventDropdown from '$lib/registry/components/event-card/event-dropdown.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'event', type: 'NDKEvent', description: 'The event for this menu', required: true },
				{ name: 'showRelayInfo', type: 'boolean', default: 'true', description: 'Show relay information in dropdown' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const eventDropdownMetadata: ComponentPageMetadata = {
	title: 'EventDropdown',
	description: 'A dropdown menu component for event actions. Includes mute, report, copy, and raw event viewing functionality with optional relay information display.',
	showcaseTitle: 'Variants',
	showcaseDescription: 'EventDropdown can be used standalone or within event cards.'
};

export const eventDropdownCards = [eventDropdownCard];
