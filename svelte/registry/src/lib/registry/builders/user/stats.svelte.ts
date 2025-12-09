import type { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getContext } from 'svelte';

interface UserStatsConfig {
	user: NDKUser;
	followPacks?: boolean;
	follows?: boolean;
	recentNotes?: boolean;
}

interface UserStatsState {
	followCount: number;
	followsYou: boolean | undefined;
	inFollowPackCount: number;
	recentNoteCount: number;
}

export function createUserStats(
	config: () => UserStatsConfig | undefined,
	ndk?: NDKSvelte
): UserStatsState {
	const ndkInstance = ndk ?? getContext<NDKSvelte>('ndk');

	const configValue = $derived(config());
	const user = $derived(configValue?.user);
	const followPacksEnabled = $derived(configValue?.followPacks ?? false);
	const followsEnabled = $derived(configValue?.follows ?? false);
	const recentNotesEnabled = $derived(configValue?.recentNotes ?? false);

	// Subscribe to user's contact list (kind 3) for follow count
	const contactListSubscription = ndkInstance.$subscribe(
		() => followsEnabled && user ? ({
			filters: [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
			bufferMs: 100,
		}) : undefined
	);

	// Subscribe to follow packs that include this user
	const followPacksSubscription = ndkInstance.$subscribe(
		() => followPacksEnabled && user ? ({
			filters: [{ kinds: [39089], '#p': [user.pubkey] }],
			bufferMs: 100,
		}) : undefined
	);

	// Subscribe to user's recent notes (past week)
	const recentNotesSubscription = ndkInstance.$subscribe(
		() => {
			if (!recentNotesEnabled || !user) return undefined;

			const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

			return {
				filters: [{ kinds: [1], authors: [user.pubkey], since: oneWeekAgo }],
				bufferMs: 100,
			};
		}
	);

	// Compute follow count from contact list
	const followCount = $derived.by(() => {
		if (!followsEnabled) return 0;

		const contactList = contactListSubscription.events[0];
		if (!contactList) return 0;

		return contactList.tags.filter(tag => tag[0] === 'p').length;
	});

	// Compute if current user follows this user
	const followsYou = $derived.by(() => {
		if (!ndkInstance.$activeUser || !user) return undefined;
		return ndkInstance.$follows.has(user.pubkey);
	});

	// Compute follow pack count
	const inFollowPackCount = $derived.by(() => {
		if (!followPacksEnabled) return 0;
		return followPacksSubscription.events.length;
	});

	// Compute recent note count (exclude replies)
	const recentNoteCount = $derived.by(() => {
		if (!recentNotesEnabled) return 0;
		return recentNotesSubscription.events.filter(e => !e.tags.some(tag => tag[0] === 'e')).length;
	});

	return {
		get followCount() {
			return followCount;
		},
		get followsYou() {
			return followsYou;
		},
		get inFollowPackCount() {
			return inFollowPackCount;
		},
		get recentNoteCount() {
			return recentNoteCount;
		}
	};
}
