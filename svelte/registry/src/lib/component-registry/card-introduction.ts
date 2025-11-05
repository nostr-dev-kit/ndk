import type { ComponentCardData, ComponentPageMetadata } from '$lib/templates/types';

export const fullCardData: ComponentCardData = {
	name: 'card-full',
	title: 'Full Card with Chrome',
	description: 'Complete social media post experience.',
	richDescription: 'EventCard with header, content, and actions — the complete social media post experience.',
	command: 'npx jsrepo add event-card',
	apiDocs: [
		{
			name: 'EventCard.Root',
			description: 'Root container that provides context to child components. Renders as a button if onclick is provided, otherwise as an article element.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'ndk',
					type: 'NDKSvelte',
					description: 'NDK instance. Optional if NDK is available in Svelte context.'
				},
				{
					name: 'event',
					type: 'NDKEvent',
					required: true,
					description: 'The event to display (any kind)'
				},
				{
					name: 'onclick',
					type: '(e: MouseEvent) => void',
					description: 'Click handler. If provided, card becomes interactive (clickable button)'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'EventCard.Header',
			description: 'Displays event author info with avatar, name, and timestamp.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'variant',
					type: "'full' | 'compact' | 'minimal'",
					default: "'full'",
					description: 'Display variant'
				},
				{
					name: 'showAvatar',
					type: 'boolean',
					default: 'true',
					description: 'Show author avatar'
				},
				{
					name: 'showTimestamp',
					type: 'boolean',
					default: 'true',
					description: 'Show timestamp'
				},
				{
					name: 'avatarSize',
					type: "'sm' | 'md' | 'lg'",
					default: "'md'",
					description: 'Avatar size'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'EventCard.Content',
			description: 'Renders event content with support for truncation and expansion.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'truncate',
					type: 'number',
					description: 'Maximum number of lines to display before truncating (uses CSS line-clamp)'
				},
				{
					name: 'showMedia',
					type: 'boolean',
					default: 'true',
					description: 'Whether to show media attachments'
				},
				{
					name: 'showLinkPreview',
					type: 'boolean',
					default: 'true',
					description: 'Whether to show link previews'
				},
				{
					name: 'highlightMentions',
					type: 'boolean',
					default: 'true',
					description: 'Whether to highlight mentions'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'EventCard.Actions',
			description: 'Container for action buttons (reply, repost, reaction, zap, etc.).',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'variant',
					type: "'default' | 'compact' | 'vertical'",
					default: "'default'",
					description: 'Display variant'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		}
	]
};

export const contentOnlyData: ComponentCardData = {
	name: 'content-only',
	title: 'Content Only (No Chrome)',
	description: 'Just the content renderer without frame.',
	richDescription: 'Just the content renderer without any frame — useful for article pages or focused reading.',
	command: 'npx jsrepo add event-content',
	apiDocs: [
		{
			name: 'EventContent',
			description: 'Universal event content renderer that parses and displays event content with support for mentions, hashtags, links, media, and custom emojis.',
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
					description: 'The event to render content from'
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
					description: 'Custom renderer configuration for overriding how segments are displayed'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		}
	]
};

export const customChromeData: ComponentCardData = {
	name: 'custom-chrome',
	title: 'Custom Chrome',
	description: 'Mix and match card primitives.',
	richDescription: "Mix and match — use the card's frame but customize the layout or add your own elements.",
	command: 'npx jsrepo add event-card',
	apiDocs: [
		{
			name: 'EventCard.Root',
			description: 'Root container that provides context to child components. Renders as a button if onclick is provided, otherwise as an article element.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'ndk',
					type: 'NDKSvelte',
					description: 'NDK instance. Optional if NDK is available in Svelte context.'
				},
				{
					name: 'event',
					type: 'NDKEvent',
					required: true,
					description: 'The event to display (any kind)'
				},
				{
					name: 'onclick',
					type: '(e: MouseEvent) => void',
					description: 'Click handler. If provided, card becomes interactive (clickable button)'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'EventCard.Header',
			description: 'Displays event author info with avatar, name, and timestamp.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'variant',
					type: "'full' | 'compact' | 'minimal'",
					default: "'full'",
					description: 'Display variant'
				},
				{
					name: 'showAvatar',
					type: 'boolean',
					default: 'true',
					description: 'Show author avatar'
				},
				{
					name: 'showTimestamp',
					type: 'boolean',
					default: 'true',
					description: 'Show timestamp'
				},
				{
					name: 'avatarSize',
					type: "'sm' | 'md' | 'lg'",
					default: "'md'",
					description: 'Avatar size'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'EventCard.Content',
			description: 'Renders event content with support for truncation and expansion.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'truncate',
					type: 'number',
					description: 'Maximum number of lines to display before truncating (uses CSS line-clamp)'
				},
				{
					name: 'showMedia',
					type: 'boolean',
					default: 'true',
					description: 'Whether to show media attachments'
				},
				{
					name: 'showLinkPreview',
					type: 'boolean',
					default: 'true',
					description: 'Whether to show link previews'
				},
				{
					name: 'highlightMentions',
					type: 'boolean',
					default: 'true',
					description: 'Whether to highlight mentions'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		},
		{
			name: 'EventCard.Actions',
			description: 'Container for action buttons (reply, repost, reaction, zap, etc.).',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{
					name: 'variant',
					type: "'default' | 'compact' | 'vertical'",
					default: "'default'",
					description: 'Display variant'
				},
				{
					name: 'class',
					type: 'string',
					description: 'Additional CSS classes'
				}
			]
		}
	]
};

export const cardIntroductionMetadata: ComponentPageMetadata = {
	title: 'Card Components',
	description: 'Understanding the chrome: consistent visual frames for Nostr events',
	showcaseTitle: 'Understanding the Pattern',
	showcaseDescription: 'See how cards and content work together.'
};

export const cardIntroductionCards = [fullCardData, contentOnlyData, customChromeData];
