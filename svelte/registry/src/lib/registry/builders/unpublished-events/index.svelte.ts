import type { NDKEvent, NDKSvelte } from '@nostr-dev-kit/svelte';
import { NDKRelaySet } from '@nostr-dev-kit/ndk';
import { untrack } from 'svelte';

export interface UnpublishedEventEntry {
	event: NDKEvent;
	relays?: string[];
	lastTryAt?: number;
}

export interface UnpublishedEventsState {
	events: UnpublishedEventEntry[];
	retry: (event: NDKEvent) => Promise<void>;
	discard: (eventId: string) => Promise<void>;
	refresh: () => Promise<void>;
}

export function createUnpublishedEvents(ndk: NDKSvelte): UnpublishedEventsState {
	let events = $state<UnpublishedEventEntry[]>([]);

	const refresh = async () => {
		if (!ndk.cacheAdapter?.getUnpublishedEvents) {
			events = [];
			return;
		}

		try {
			const unpublished = await ndk.cacheAdapter.getUnpublishedEvents();

			// Set up listeners for successful publishes
			for (const entry of unpublished) {
				const onPublished = () => {
					// Remove from state when published
					events = events.filter((e) => e.event.id !== entry.event.id);
					entry.event.off('published', onPublished);
				};

				entry.event.on('published', onPublished);
			}

			events = unpublished;
		} catch (error) {
			console.error('Error fetching unpublished events:', error);
			events = [];
		}
	};

	const retry = async (event: NDKEvent) => {
		const entry = events.find((e) => e.event.id === event.id);
		if (!entry) return;

		try {
			// Create relay set from the original target relays if available
			const relaySet = entry.relays
				? NDKRelaySet.fromRelayUrls(entry.relays, ndk)
				: undefined;

			// Attempt to publish again
			await event.publish(relaySet);

			// If successful, it will be automatically removed from cache
			// via the "published" event listener we set up
		} catch (error) {
			console.error('Retry failed:', error);
			// Event remains in unpublished cache for future retry
			// Re-fetch to update the lastTryAt timestamp
			await refresh();
			throw error;
		}
	};

	const discard = async (eventId: string) => {
		if (!ndk.cacheAdapter?.discardUnpublishedEvent) {
			return;
		}

		try {
			await ndk.cacheAdapter.discardUnpublishedEvent(eventId);
			// Remove from local state
			events = events.filter((e) => e.event.id !== eventId);
		} catch (error) {
			console.error('Error discarding unpublished event:', error);
			throw error;
		}
	};

	// Initial fetch
	$effect(() => {
		refresh();
	});

	// Listen for new publish failures
	$effect(() => {
		const handlePublishFailed = () => {
			// Refresh the list when a new publish fails
			untrack(() => refresh());
		};

		ndk.on('event:publish-failed', handlePublishFailed);

		return () => {
			ndk.off('event:publish-failed', handlePublishFailed);
		};
	});

	return {
		get events() {
			return events;
		},
		retry,
		discard,
		refresh
	};
}
