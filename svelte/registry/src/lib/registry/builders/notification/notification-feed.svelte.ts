import { getContext } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

export interface NotificationFeedConfig {
	pubkey: string;
	kinds?: number[];
	since?: number;
	sort?: 'time' | 'count' | 'tag-time' | 'unique-authors';
	limit?: number;
}

export interface NotificationGroup {
	targetEvent: NDKEvent;
	interactions: NDKEvent[];
	types: Map<number, NDKEvent[]>;
	actors: string[];
	mostRecentInteraction: number;
	totalCount: number;
}

const DEFAULT_NOTIFICATION_KINDS = [
	1, // Mentions/replies
	6, // Reposts (legacy)
	16, // Generic reposts
	1111 // GenericReply
];

export function createNotificationFeed(
	config: () => NotificationFeedConfig,
	ndk?: NDKSvelte
) {
	const resolvedNDK = ndk || getContext<NDKSvelte>('ndk');

	let subscription = $state<ReturnType<NDKSvelte['$metaSubscribe']> | null>(null);

	$effect(() => {
		const {
			pubkey,
			kinds = DEFAULT_NOTIFICATION_KINDS,
			since = Date.now() / 1000 - 24 * 60 * 60,
			sort = 'tag-time',
			limit
		} = config();

		subscription = resolvedNDK.$metaSubscribe(() => ({
			filters: [
				{
					kinds,
					'#p': [pubkey],
					since,
					...(limit && { limit })
				}
			],
			sort,
			closeOnEose: false
		}));

		return () => {
			subscription?.stop();
		};
	});

	const grouped = $derived.by(() => {
		if (!subscription?.events) return [];

		return subscription.events.map((targetEvent) => {
			const interactions = subscription.eventsTagging(targetEvent);

			// Group interactions by kind
			const byType = new Map<number, NDKEvent[]>();
			interactions.forEach((interaction) => {
				const kind = interaction.kind!;
				if (!byType.has(kind)) byType.set(kind, []);
				byType.get(kind)!.push(interaction);
			});

			// Get unique actors
			const actors = [...new Set(interactions.map((i) => i.pubkey))];

			// Most recent interaction timestamp
			const mostRecent = Math.max(...interactions.map((i) => i.created_at!));

			return {
				targetEvent,
				interactions,
				types: byType,
				actors,
				mostRecentInteraction: mostRecent,
				totalCount: interactions.length
			} as NotificationGroup;
		});
	});

	const byType = $derived.by(() => {
		return {
			reactions: grouped.filter((g) => g.types.has(7)),
			zaps: grouped.filter((g) => g.types.has(9735)),
			reposts: grouped.filter((g) => g.types.has(6) || g.types.has(16)),
			replies: grouped.filter((g) => g.types.has(1) || g.types.has(1111))
		};
	});

	return {
		get all() {
			return grouped;
		},
		get byType() {
			return byType;
		},
		get count() {
			return subscription?.count ?? 0;
		},
		get loading() {
			return !subscription?.eosed;
		}
	};
}
