import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { NDKArticle, type NDKEvent, NDKSubscriptionCacheUsage, type NDKUser } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import type { PropType } from './edit-props-context.svelte';

export interface FetchResult {
	success: boolean;
	value?: NDKUser | NDKEvent | NDKArticle | string;
	error?: string;
}

/**
 * Validates an identifier format
 */
export function validateIdentifier(type: PropType, identifier: string): { valid: boolean; error?: string } {
	identifier = identifier.trim();

	if (!identifier) {
		return { valid: false, error: 'Identifier cannot be empty' };
	}

	try {
		switch (type) {
			case 'user':
				if (identifier.startsWith('npub1')) {
					nip19.decode(identifier);
					return { valid: true };
				}
				if (identifier.match(/^[0-9a-f]{64}$/)) {
					return { valid: true };
				}
				return { valid: false, error: 'Must be npub1... or hex pubkey' };

			case 'event':
				if (identifier.startsWith('naddr1')) {
					nip19.decode(identifier);
					return { valid: true };
				}
				
				if (identifier.startsWith('nevent1')) {
					nip19.decode(identifier);
					return { valid: true };
				}
				if (identifier.startsWith('note1')) {
					nip19.decode(identifier);
					return { valid: true };
				}
				if (identifier.match(/^[0-9a-f]{64}$/)) {
					return { valid: true };
				}
				return { valid: false, error: 'Must be nevent1..., note1..., or hex event id' };

			case 'article':
				if (identifier.startsWith('naddr1')) {
					nip19.decode(identifier);
					return { valid: true };
				}
				return { valid: false, error: 'Must be naddr1...' };

			case 'hashtag':
				if (identifier.match(/^[a-zA-Z0-9_-]+$/)) {
					return { valid: true };
				}
				return { valid: false, error: 'Hashtag must contain only letters, numbers, dashes, and underscores' };

			case 'kind':
			case 'text':
				return { valid: true };

			default:
				return { valid: false, error: 'Unknown type' };
		}
	} catch (e) {
		return { valid: false, error: 'Invalid identifier format' };
	}
}

/**
 * Fetches an NDK object from an identifier
 */
export async function fetchFromIdentifier(
	ndk: NDKSvelte,
	type: PropType,
	identifier: string
): Promise<FetchResult> {
	identifier = identifier.trim();

	const validation = validateIdentifier(type, identifier);
	if (!validation.valid) {
		return { success: false, error: validation.error };
	}

	try {
		switch (type) {
			case 'user': {
				let pubkey: string;
				if (identifier.startsWith('npub1')) {
					const decoded = nip19.decode(identifier);
					pubkey = decoded.data as string;
				} else {
					pubkey = identifier;
				}
				const user = ndk.getUser({ pubkey });
				return { success: true, value: user };
			}

			case 'event': {
				let eventId: string;
				let relays: string[] = [];

				if (identifier.startsWith('nevent1')) {
					const decoded = nip19.decode(identifier);
					const data = decoded.data as { id: string; relays?: string[] };
					eventId = data.id;
					relays = data.relays || [];
				} else if (identifier.startsWith('note1')) {
					const decoded = nip19.decode(identifier);
					eventId = decoded.data as string;
				} else {
					eventId = identifier;
				}

				const event = await ndk.fetchEvent(eventId, { closeOnEose: true });
				if (!event) {
					return { success: false, error: 'Event not found' };
				}
				return { success: true, value: event };
			}

			case 'article': {
				if (!identifier.startsWith('naddr1')) {
					return { success: false, error: 'Article must be naddr1...' };
				}

				const event = await ndk.fetchEvent(identifier, { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE});
				const article = event ? NDKArticle.from(event) : undefined;
				return { success: true, value: article };
			}

			case 'hashtag':
			case 'kind':
			case 'text':
				return { success: true, value: identifier };

			default:
				return { success: false, error: 'Unknown type' };
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch'
		};
	}
}
