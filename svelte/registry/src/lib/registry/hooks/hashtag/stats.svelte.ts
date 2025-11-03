import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getContext } from 'svelte';

interface HashtagStatsConfig {
	hashtags: string[];
	since: number;
	relayUrls?: string[];
	hashtagCap?: number;
}

interface HashtagStatsState {
	events: NDKEvent[];
	pubkeys: Set<string>;
	noteCount: number;
	topContributor: string | undefined;
	dailyDistribution: number[];
}

export function createHashtagStats(
	config: () => HashtagStatsConfig | undefined,
	ndk?: NDKSvelte
): HashtagStatsState {
	const ndkInstance = ndk ?? getContext<NDKSvelte>('ndk');

	const configValue = $derived(config());
	const hashtags = $derived(configValue?.hashtags ?? []);
	const since = $derived(configValue?.since ?? 0);
	const relayUrls = $derived(configValue?.relayUrls);
	const hashtagCap = $derived(configValue?.hashtagCap ?? 6);

	// Subscribe to notes with hashtags
	const hashtagNotesSubscription = ndkInstance.$subscribe(
		() => hashtags.length > 0 ? ({
			filters: [{
				kinds: [1],
				'#t': hashtags,
				since
			}],
			bufferMs: 100,
			...(relayUrls ? { relayUrls } : {})
		}) : undefined
	);

	// Filter events to exclude those with too many hashtags
	const filteredEvents = $derived.by(() => {
		return hashtagNotesSubscription.events.filter(event => {
			const hashtagCount = event.tags.filter(tag => tag[0] === 't').length;
			return hashtagCount <= hashtagCap;
		});
	});

	// Compute unique pubkeys
	const pubkeys = $derived.by(() => {
		return new Set(filteredEvents.map(event => event.pubkey));
	});

	// Compute note count
	const noteCount = $derived.by(() => {
		return filteredEvents.length;
	});

	// Compute top contributor (author with most posts)
	const topContributor = $derived.by(() => {
		const counts = new Map<string, number>();

		filteredEvents.forEach(event => {
			counts.set(event.pubkey, (counts.get(event.pubkey) || 0) + 1);
		});

		const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
		return sorted[0]?.[0];
	});

	// Compute daily distribution for past 7 days
	const dailyDistribution = $derived.by(() => {
		const days = Array(7).fill(0);
		const now = Math.floor(Date.now() / 1000);
		const dayInSeconds = 24 * 60 * 60;

		filteredEvents.forEach(event => {
			const daysAgo = Math.floor((now - event.created_at!) / dayInSeconds);
			if (daysAgo >= 0 && daysAgo < 7) {
				days[6 - daysAgo]++;
			}
		});

		return days;
	});

	return {
		get events() {
			return filteredEvents;
		},
		get pubkeys() {
			return pubkeys;
		},
		get noteCount() {
			return noteCount;
		},
		get topContributor() {
			return topContributor;
		},
		get dailyDistribution() {
			return dailyDistribution;
		}
	};
}
