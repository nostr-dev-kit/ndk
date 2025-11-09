import { NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Platform information from NIP-89 handler
 */
export type HandlerPlatform = {
	platform: 'web' | 'ios' | 'android';
	url: string;
};

/**
 * Application handler information from NIP-89
 */
export type AppHandlerInfo = {
	pubkey: string;
	name?: string;
	about?: string;
	picture?: string;
	platforms: HandlerPlatform[];
};

/**
 * Creates a builder for querying NIP-89 application handler recommendations
 *
 * NIP-89 defines kind 31989 for user recommendations of apps that handle specific event kinds
 *
 * @param getProps - Function returning kind number to query
 * @param ndk - NDKSvelte instance
 * @returns Reactive state with recommendations
 *
 * @example
 * ```ts
 * const recommendations = createAppHandlerRecommendations(() => ({ kind: 9999 }), ndk);
 *
 * $effect(() => {
 *   console.log('Recommended handler addresses:', recommendations.handlers);
 * });
 * ```
 */
export function createAppHandlerRecommendations(
	getProps: () => { kind: number },
	ndk: NDKSvelte
) {
	let handlers = $state<string[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function load() {
		const { kind } = getProps();
		if (!kind) return;

		loading = true;
		error = null;

		try {
			const filter: NDKFilter = {
				kinds: [31989],
				'#d': [kind.toString()]
			};

			const events = await ndk.fetchEvents(filter);
			const handlerSet = new Set<string>();

			// Extract 'a' tags that reference kind 31990 handlers
			for (const event of events) {
				const aTags = event.getMatchingTags('a');
				for (const [, handlerAddress] of aTags) {
					if (handlerAddress) {
						handlerSet.add(handlerAddress);
					}
				}
			}

			handlers = Array.from(handlerSet);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch recommendations';
		} finally {
			loading = false;
		}
	}

	return {
		get handlers() {
			return handlers;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		load
	};
}

/**
 * Creates a builder for fetching NIP-89 application handler information
 *
 * NIP-89 defines kind 31990 for publishing handler information including:
 * - App name, description, icon
 * - Platform-specific URLs (web, iOS, Android)
 * - URL templates with <bech32> placeholder for event entities
 *
 * @param getProps - Function returning handler address
 * @param ndk - NDKSvelte instance
 * @returns Reactive state with handler info
 *
 * @example
 * ```ts
 * const handlerInfo = createAppHandlerInfo(
 *   () => ({ address: '31990:pubkey:d-tag' }),
 *   ndk
 * );
 *
 * await handlerInfo.load();
 * console.log('Handler platforms:', handlerInfo.info?.platforms);
 * ```
 */
export function createAppHandlerInfo(
	getProps: () => { address: string },
	ndk: NDKSvelte
) {
	let info = $state<AppHandlerInfo | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function load() {
		const { address } = getProps();
		if (!address) return;

		loading = true;
		error = null;

		try {
			// Parse address: kind:pubkey:d-tag
			const [kindStr, pubkey, dTag] = address.split(':');
			const kind = parseInt(kindStr, 10);

			if (kind !== 31990) {
				throw new Error('Invalid handler address: must be kind 31990');
			}

			const filter: NDKFilter = {
				kinds: [31990],
				authors: [pubkey],
				'#d': [dTag]
			};

			const events = await ndk.fetchEvents(filter);
			const event = Array.from(events)[0];

			if (!event) {
				throw new Error('Handler not found');
			}

			// Parse handler information
			const platforms: HandlerPlatform[] = [];

			// Extract platform URLs
			const webTags = event.getMatchingTags('web');
			const iosTags = event.getMatchingTags('ios');
			const androidTags = event.getMatchingTags('android');

			if (webTags.length > 0 && webTags[0][1]) {
				platforms.push({ platform: 'web', url: webTags[0][1] });
			}
			if (iosTags.length > 0 && iosTags[0][1]) {
				platforms.push({ platform: 'ios', url: iosTags[0][1] });
			}
			if (androidTags.length > 0 && androidTags[0][1]) {
				platforms.push({ platform: 'android', url: androidTags[0][1] });
			}

			// Extract metadata from content (JSON)
			let name: string | undefined;
			let about: string | undefined;
			let picture: string | undefined;

			try {
				const content = JSON.parse(event.content);
				name = content.name;
				about = content.about;
				picture = content.picture;
			} catch {
				// Content is not JSON or empty, skip metadata
			}

			info = {
				pubkey: event.pubkey,
				name,
				about,
				picture,
				platforms
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch handler info';
		} finally {
			loading = false;
		}
	}

	return {
		get info() {
			return info;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		load
	};
}

/**
 * Helper function to replace <bech32> placeholder in handler URL with actual entity
 *
 * @param template - URL template with <bech32> placeholder
 * @param bech32 - Actual bech32 entity (nevent, note1, naddr, etc.)
 * @returns URL with placeholder replaced
 *
 * @example
 * ```ts
 * const url = replaceUrlTemplate(
 *   'https://app.example.com/event/<bech32>',
 *   'nevent1...'
 * );
 * // Returns: 'https://app.example.com/event/nevent1...'
 * ```
 */
export function replaceUrlTemplate(template: string, bech32: string): string {
	return template.replace(/<bech32>/g, bech32);
}
