import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { getContext } from 'svelte';

interface ContentTabConfig {
	pubkeys: string[];
	kinds: number[];
	since?: number;
	subOpts?: NDKSubscriptionOptions;
	sort?: (tabs: ContentTab[]) => ContentTab[];
}

export interface ContentTab {
	kind: number;
	count: number;
	lastPublished?: number;
}

/**
 * Sort function that orders tabs by count (most published first)
 */
export function byCount(tabs: ContentTab[]): ContentTab[] {
	return [...tabs].sort((a, b) => b.count - a.count);
}

/**
 * Sort function that orders tabs by recency (most recently published first)
 */
export function byRecency(tabs: ContentTab[]): ContentTab[] {
	return [...tabs].sort((a, b) => {
		if (a.lastPublished === undefined && b.lastPublished === undefined) return 0;
		if (a.lastPublished === undefined) return 1;
		if (b.lastPublished === undefined) return -1;
		return b.lastPublished - a.lastPublished;
	});
}

/**
 * Creates a content tab sampler that subscribes to multiple kinds
 * and tracks which content types a user actually publishes.
 *
 * @param config - Configuration closure
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with sorted tabs array
 *
 * @example
 * ```svelte
 * <script>
 *   import { createContentSampler, byCount } from './';
 *
 *   const tabSampler = createContentSampler(() => ({
 *     pubkeys: ['hexpubkey'],
 *     kinds: [1, 30023, 1063],
 *     sort: byCount
 *   }));
 * </script>
 *
 * {#each tabSampler.tabs as tab}
 *   <button>Kind {tab.kind} ({tab.count})</button>
 * {/each}
 * ```
 */
export function createContentSampler(
	config: () => ContentTabConfig,
	ndk?: NDKSvelte
) {
	const ndkInstance = ndk ?? getContext<NDKSvelte>('ndk');

	const configValue = $derived(config());
	const { pubkeys, kinds, since, subOpts, sort } = $derived(configValue);

	// Create subscription with n+1 filters:
	// - One filter for all kinds with limit 400 for a sample
	// - One filter per kind with limit 1 to detect if user publishes that kind
	const subscription = ndkInstance.$subscribe(() => {
		if (!pubkeys.length || !kinds.length) return undefined;

		return {
			filters: [
				{ kinds, authors: pubkeys, since, limit: 400 },
				...kinds.map((kind) => ({ kinds: [kind], authors: pubkeys, since, limit: 1 }))
			],
			cacheUnconstrainFilter: [],
			...subOpts
		};
	});

	// Compute tabs with counts and last published timestamp
	const tabs = $derived.by((): ContentTab[] => {
		const kindMap = new Map<number, ContentTab>();

		// Initialize all kinds with zero count
		for (const kind of kinds) {
			kindMap.set(kind, { kind, count: 0 });
		}

		// Count events and track last published
		for (const event of subscription.events) {
			const tab = kindMap.get(event.kind);
			if (tab) {
				tab.count++;
				const eventTimestamp = event.created_at ?? 0;
				if (tab.lastPublished === undefined || eventTimestamp > tab.lastPublished) {
					tab.lastPublished = eventTimestamp;
				}
			}
		}

		// Convert to array and filter out kinds with no events
		let result = Array.from(kindMap.values()).filter(tab => tab.count > 0);

		// Apply sorting if provided
		if (sort) {
			result = sort(result);
		}

		return result;
	});

	return {
		get tabs() {
			return tabs;
		}
	};
}
