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
		command: 'npx jsrepo add event-card',
		apiDocs: [
			{
				name: 'EventCard',
				description: 'Composable card primitives for displaying Nostr events with header, content, and actions.',
				importPath: "import { EventCard } from '$lib/registry/components/event-card'",
				props: [
					{
						name: 'Root',
						type: 'Component',
						description: 'Root container providing context. Accepts: ndk (NDKSvelte), event (NDKEvent, required), onclick ((e: MouseEvent) => void), class (string)'
					},
					{
						name: 'Header',
						type: 'Component',
						description: 'Displays author info. Accepts: variant ("full" | "compact" | "minimal"), showAvatar (boolean), showTimestamp (boolean), avatarSize ("sm" | "md" | "lg"), class (string)'
					},
					{
						name: 'Content',
						type: 'Component',
						description: 'Renders event content. Accepts: truncate (number), showMedia (boolean), showLinkPreview (boolean), highlightMentions (boolean), class (string)'
					},
					{
						name: 'Actions',
						type: 'Component',
						description: 'Action buttons container. Accepts: variant ("default" | "compact" | "vertical"), class (string)'
					}
				]
			}
		]
	},
	{
		name: 'content-layer',
		title: 'Content Layer',
		description: 'The event body renderer',
		richDescription:
			'Content components parse and render event bodies based on kind. They handle markdown, mentions, hashtags, and embedded references.',
		command: 'npx jsrepo add event-content',
		apiDocs: [
			{
				name: 'EventContent',
				description: 'Universal content renderer for parsing and displaying event content with mentions, hashtags, links, media, and custom emojis.',
				importPath: "import { EventContent } from '$lib/registry/ui/event-content.svelte'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: true,
						description: 'NDK instance'
					},
					{
						name: 'event',
						type: 'NDKEvent',
						description: 'Event to render content from'
					},
					{
						name: 'content',
						type: 'string',
						description: 'Raw content string (alternative to event)'
					},
					{
						name: 'emojiTags',
						type: 'string[][]',
						description: 'Custom emoji tags from the event'
					},
					{
						name: 'renderer',
						type: 'ContentRenderer',
						description: 'Custom renderer configuration for overriding segment display'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]
			}
		]
	},
	{
		name: 'embed-layer',
		title: 'Embed Layer',
		description: 'Referenced entity previews',
		richDescription:
			'When content references other events or entities (via bech32 identifiers), they render as rich previews inside the content.',
		command: 'npx jsrepo add embedded-event',
		apiDocs: [
			{
				name: 'EmbeddedEvent',
				description: 'Renders embedded event references as rich previews. Automatically fetches and displays referenced events with loading and error states.',
				importPath: "import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: true,
						description: 'NDK instance'
					},
					{
						name: 'bech32',
						type: 'string',
						required: true,
						description: 'Bech32-encoded event reference (note1, nevent, etc.)'
					},
					{
						name: 'variant',
						type: "'inline' | 'card' | 'compact'",
						default: "'card'",
						description: 'Display variant for the embedded event'
					},
					{
						name: 'renderer',
						type: 'ContentRenderer',
						description: 'Custom renderer configuration for the embedded content'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]
			}
		]
	}
];
