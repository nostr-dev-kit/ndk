import type { ComponentCardData } from '$lib/templates/types';

export const notificationBuilderCard: ComponentCardData = {
	name: 'notification-builder',
	title: 'createNotificationFeed Builder',
	richDescription:
		'Headless builder using $metaSubscription to track and group interactions by target event. Perfect for building custom notification UIs.',
	command: 'npx jsrepo add notification',
	apiDocs: [
		{
			name: 'createNotificationFeed',
			description:
				'Builder function that uses $metaSubscription to fetch and group notifications by target event. Returns NotificationFeedState with grouped notifications, counts, and loading state.',
			importPath: "import { createNotificationFeed } from '$lib/registry/builders/notification'",
			props: [
				{
					name: 'config',
					type: '() => NotificationFeedConfig',
					required: true,
					description:
						'Reactive function returning: pubkey (string), kinds (number[]), since (number), sort, limit'
				},
				{
					name: 'ndk',
					type: 'NDKSvelte',
					description: 'NDK instance (optional if provided via context)'
				}
			]
		}
	]
};

export const notificationPrimitivesCard: ComponentCardData = {
	name: 'notification-primitives',
	title: 'NotificationItem Primitives',
	richDescription:
		'Composable UI primitives for building custom notification layouts. Includes Root, Actors, Action, Content, and Timestamp components.',
	command: 'npx jsrepo add notification',
	apiDocs: [
		{
			name: 'NotificationItem.Root',
			description:
				'Context provider that sets up notification data for child primitives. Use the contents class for transparent wrapper.',
			importPath: "import NotificationItem from '$lib/registry/ui/notification'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{
					name: 'notification',
					type: 'NotificationGroup',
					required: true,
					description: 'Notification group data from createNotificationFeed'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'NotificationItem.Actors',
			description:
				'Shows avatars of users who interacted. Uses AvatarGroup internally. Supports custom snippet for advanced layouts.',
			importPath: "import NotificationItem from '$lib/registry/ui/notification'",
			props: [
				{
					name: 'max',
					type: 'number',
					default: '5',
					description: 'Maximum avatars before showing overflow'
				},
				{ name: 'size', type: 'number', default: '32', description: 'Avatar size in pixels' },
				{
					name: 'spacing',
					type: "'tight' | 'normal' | 'loose'",
					default: "'tight'",
					description: 'Spacing between avatars'
				},
				{
					name: 'snippet',
					type: 'Snippet<[{ pubkeys: string[], count: number }]>',
					description: 'Custom render snippet for full control'
				}
			]
		},
		{
			name: 'NotificationItem.Action',
			description:
				'Shows interaction type (reacted, zapped, reposted, replied) with icon and count. Supports custom snippet.',
			importPath: "import NotificationItem from '$lib/registry/ui/notification'",
			props: [
				{
					name: 'snippet',
					type: 'Snippet<[{ type: string, count: number, icon: ComponentType }]>',
					description: 'Custom render snippet for full control'
				}
			]
		},
		{
			name: 'NotificationItem.Content',
			description:
				'Renders the embedded event being interacted with using ContentRenderer and EmbeddedEvent.',
			importPath: "import NotificationItem from '$lib/registry/ui/notification'",
			props: [
				{
					name: 'renderer',
					type: 'ContentRenderer',
					description: 'Custom content renderer (optional, has sensible defaults)'
				},
				{
					name: 'snippet',
					type: 'Snippet<[{ event: NDKEvent }]>',
					description: 'Custom render snippet for full control'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'NotificationItem.Timestamp',
			description:
				'Shows relative time of most recent interaction using createTimeAgo. Updates every minute.',
			importPath: "import NotificationItem from '$lib/registry/ui/notification'",
			props: [
				{
					name: 'snippet',
					type: 'Snippet<[{ timestamp: number, formatted: string }]>',
					description: 'Custom render snippet for full control'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const notificationItemCompactCard: ComponentCardData = {
	name: 'notification-item-compact',
	title: 'NotificationItem Compact',
	richDescription:
		'Pre-built compact notification item. Shows avatars, action, timestamp, and embedded content in a horizontal layout. Ideal for notification feeds.',
	command: 'npx jsrepo add notification-item-compact',
	apiDocs: [
		{
			name: 'NotificationItemCompact',
			description: 'Compact notification item with horizontal layout',
			importPath:
				"import NotificationItemCompact from '$lib/registry/components/notification/items/compact'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{
					name: 'notification',
					type: 'NotificationGroup',
					required: true,
					description: 'Notification group from createNotificationFeed'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const notificationItemExpandedCard: ComponentCardData = {
	name: 'notification-item-expanded',
	title: 'NotificationItem Expanded',
	richDescription:
		'Pre-built expanded notification item. Shows full event content with actors below. Best for detailed notification views.',
	command: 'npx jsrepo add notification-item-expanded',
	apiDocs: [
		{
			name: 'NotificationItemExpanded',
			description: 'Expanded notification item with full content display',
			importPath:
				"import NotificationItemExpanded from '$lib/registry/components/notification/items/expanded'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{
					name: 'notification',
					type: 'NotificationGroup',
					required: true,
					description: 'Notification group from createNotificationFeed'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const notificationFeedCard: ComponentCardData = {
	name: 'notification-feed',
	title: 'NotificationFeed',
	richDescription:
		'Complete notification feed component using createNotificationFeed builder. Handles loading states, empty states, and custom item rendering.',
	command: 'npx jsrepo add notification-feed',
	apiDocs: [
		{
			name: 'NotificationFeed',
			description: 'Complete notification feed with builder integration',
			importPath: "import NotificationFeed from '$lib/registry/components/notification/feeds/basic'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{
					name: 'pubkey',
					type: 'string',
					required: true,
					description: 'Target user pubkey to show notifications for'
				},
				{
					name: 'kinds',
					type: 'number[]',
					default: '[1, 7, 9735, 6, 16, 1111]',
					description: 'Event kinds to track (mentions, reactions, zaps, reposts, replies)'
				},
				{
					name: 'since',
					type: 'number',
					default: '24h ago',
					description: 'Unix timestamp to start from'
				},
				{
					name: 'sort',
					type: "'time' | 'count' | 'tag-time' | 'unique-authors'",
					default: "'tag-time'",
					description: 'Sort order for notifications'
				},
				{ name: 'limit', type: 'number', description: 'Max notifications to show' },
				{
					name: 'itemSnippet',
					type: 'Snippet<[{ ndk: NDKSvelte, notification: NotificationGroup }]>',
					description: 'Custom snippet for rendering each notification'
				},
				{
					name: 'emptySnippet',
					type: 'Snippet',
					description: 'Custom snippet for empty state'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const notificationMetadata = {
	title: 'Notification',
	showcaseTitle: 'Notification System',
	showcaseDescription:
		'Real-time notification system using $metaSubscription. Groups interactions by target event and provides composable primitives for custom layouts.',
	cards: [
		notificationBuilderCard,
		notificationPrimitivesCard,
		notificationItemCompactCard,
		notificationItemExpandedCard,
		notificationFeedCard,
		notificationPanelCard
	],
	apiDocs: [
		{
			name: 'createNotificationFeed',
			description:
				'Builder function that uses $metaSubscription to fetch and group notifications',
			importPath: "import { createNotificationFeed } from '$lib/registry/builders/notification'",
			props: [
				{
					name: 'config',
					type: '() => NotificationFeedConfig',
					required: true,
					description:
						'Reactive function returning: pubkey (string), kinds (number[]), since (number), sort, limit'
				},
				{
					name: 'ndk',
					type: 'NDKSvelte',
					description: 'NDK instance (optional if provided via context)'
				}
			]
		},
		{
			name: 'NotificationItem',
			description:
				'Composable primitives for building custom notification layouts (Root, Actors, Action, Content, Timestamp)',
			importPath: "import NotificationItem from '$lib/registry/ui/notification'",
			props: []
		},
		{
			name: 'NotificationFeed',
			description: 'Complete notification feed component',
			importPath: "import NotificationFeed from '$lib/registry/components/notification/feeds/basic'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{
					name: 'pubkey',
					type: 'string',
					required: true,
					description: 'Target user pubkey'
				}
			]
		}
	]
};
