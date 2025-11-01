import type { NDKUser, NDKSubscription } from '@nostr-dev-kit/ndk';
import { NDKRelaySet } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '../../ndk-svelte.svelte.js';
import { resolveNDK } from '../resolve-ndk.svelte.js';

export interface UserInputResult {
    user: NDKUser;
}

export interface UserInputConfig {
    query: string;
    onSelect?: (user: NDKUser) => void;
    debounceMs?: number;
    relaySearch?: string[];
}

const NIP05_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NPUB_PATTERN = /^(npub1|nprofile1)[a-z0-9]{20,}/i;

/**
 * Creates a reactive user input search manager
 *
 * Searches cached profiles for user matches and debounces NIP-05/npub/nprofile lookups.
 * Results are sorted with followed users first.
 *
 * @param config - Function returning configuration with query and callbacks
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with search results and selection methods
 *
 * @example
 * ```svelte
 * <script>
 *   let query = $state('');
 *   const userInput = createUserInput(() => ({
 *     query,
 *     onSelect: (user) => console.log('Selected:', user)
 *   }));
 * </script>
 *
 * <input bind:value={query} placeholder="Search users..." />
 * {#each userInput.results as result}
 *   <button onclick={() => userInput.selectUser(result.user)}>
 *     {result.user.npub}
 *   </button>
 * {/each}
 * ```
 */
export function createUserInput(
    config: () => UserInputConfig,
    ndk?: NDKSvelte
) {
    console.log('[UserInput] createUserInput called, initializing...');
    const resolvedNDK = resolveNDK(ndk);
    console.log('[UserInput] NDK resolved, cache adapter available:', !!resolvedNDK.cacheAdapter);

    let results = $state<UserInputResult[]>([]);
    let selectedUser = $state<NDKUser | null>(null);
    let loading = $state(false);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let activeSubscription: NDKSubscription | null = null;
    console.log('[UserInput] State initialized');

    /**
     * Searches cached profiles to find matching users
     */
    async function searchCachedProfiles(query: string): Promise<UserInputResult[]> {
        console.log('[UserInput] searchCachedProfiles called with query:', query);

        if (!query.trim()) {
            console.log('[UserInput] Empty query, returning empty results');
            return [];
        }

        const cacheAdapter = resolvedNDK.cacheAdapter;
        console.log('[UserInput] Cache adapter available:', !!cacheAdapter);
        console.log('[UserInput] Cache adapter has getProfiles:', !!cacheAdapter?.getProfiles);

        if (!cacheAdapter?.getProfiles) {
            console.log('[UserInput] Using fallback: searching all cached profiles');
            const allProfiles = cacheAdapter?.getAllProfilesSync?.() || new Map();
            console.log('[UserInput] Total cached profiles:', allProfiles.size);

            const matchedResults: UserInputResult[] = [];
            const lowerQuery = query.toLowerCase();

            for (const [pubkey, profileEntry] of allProfiles) {
                const profile = 'profile' in profileEntry ? profileEntry.profile : profileEntry;
                if (
                    profile.name?.toLowerCase().includes(lowerQuery) ||
                    profile.displayName?.toLowerCase().includes(lowerQuery) ||
                    profile.nip05?.toLowerCase().includes(lowerQuery) ||
                    profile.about?.toLowerCase().includes(lowerQuery)
                ) {
                    const user = resolvedNDK.getUser({ pubkey });
                    matchedResults.push({ user });
                }
            }
            console.log('[UserInput] Fallback search found:', matchedResults.length, 'matches');
            return matchedResults;
        }

        console.log('[UserInput] Using cache adapter.getProfiles');
        const profileMap = await cacheAdapter.getProfiles({
            fields: ['name', 'displayName', 'nip05', 'about'],
            contains: query
        });

        if (!profileMap) {
            console.log('[UserInput] getProfiles returned null/undefined');
            return [];
        }

        const results = Array.from(profileMap.keys()).map((pubkey) => ({
            user: resolvedNDK.getUser({ pubkey })
        }));

        console.log('[UserInput] Cache search found:', results.length, 'matches');
        return results;
    }

    /**
     * Looks up user by NIP-05, npub, or nprofile
     */
    async function lookupUser(input: string): Promise<UserInputResult | null> {
        console.log('[UserInput] lookupUser called with input:', input);
        try {
            console.log('[UserInput] Fetching user from network...');
            const user = await resolvedNDK.fetchUser(input);
            if (!user) {
                console.log('[UserInput] No user found for input:', input);
                return null;
            }

            console.log('[UserInput] User found:', user.npub);
            return { user };
        } catch (err) {
            console.error('[UserInput] Failed to lookup user:', err);
            return null;
        }
    }

    /**
     * Performs cache search
     */
    async function performCacheSearch(query: string) {
        console.log('[UserInput] performCacheSearch called with query:', query);

        if (!query.trim()) {
            console.log('[UserInput] Empty query, clearing results');
            results = [];
            return;
        }

        console.log('[UserInput] Starting cache search...');
        const cachedResults = await searchCachedProfiles(query);

        console.log('[UserInput] Sorting results, follows first');
        cachedResults.sort((a, b) => {
            const aFollowing = resolvedNDK.$follows.has(a.user.pubkey);
            const bFollowing = resolvedNDK.$follows.has(b.user.pubkey);
            if (aFollowing && !bFollowing) return -1;
            if (!aFollowing && bFollowing) return 1;
            return 0;
        });

        console.log('[UserInput] Setting results from cache:', cachedResults.length, 'items');
        results = cachedResults;
    }

    /**
     * Performs network lookup for NIP-05/npub/nprofile
     */
    async function performNetworkLookup(query: string) {
        console.log('[UserInput] performNetworkLookup called with query:', query);
        console.log('[UserInput] Setting loading = true');
        loading = true;

        console.log('[UserInput] Starting network lookup...');
        const lookupResult = await lookupUser(query);
        if (lookupResult) {
            const existingIndex = results.findIndex(r => r.user.pubkey === lookupResult.user.pubkey);
            console.log('[UserInput] User already in results:', existingIndex !== -1, 'at index:', existingIndex);

            if (existingIndex === -1) {
                const isFollowing = resolvedNDK.$follows.has(lookupResult.user.pubkey);
                if (isFollowing) {
                    console.log('[UserInput] Adding followed user to top of results');
                    results = [lookupResult, ...results];
                } else {
                    console.log('[UserInput] Adding user to end of results');
                    results = [...results, lookupResult];
                }
            } else {
                console.log('[UserInput] Updating existing result');
                results[existingIndex] = lookupResult;
            }
        } else {
            console.log('[UserInput] Network lookup returned no result');
        }

        console.log('[UserInput] Setting loading = false, final results count:', results.length);
        loading = false;
    }

    /**
     * Performs NIP-50 relay search
     */
    function performRelaySearch(query: string, relays: string[]) {
        console.log('[UserInput] performRelaySearch called with query:', query, 'relays:', relays);

        if (activeSubscription) {
            console.log('[UserInput] Stopping previous relay subscription');
            activeSubscription.stop();
            activeSubscription = null;
        }

        if (!query.trim() || relays.length === 0) {
            console.log('[UserInput] Empty query or no relays, skipping relay search');
            return;
        }

        console.log('[UserInput] Setting loading = true for relay search');
        loading = true;

        console.log('[UserInput] Creating relay set for search');
        const relayInstances = relays.map(url => resolvedNDK.pool.getRelay(url, true, true));
        const relaySet = new NDKRelaySet(new Set(relayInstances), resolvedNDK);

        console.log('[UserInput] Creating relay subscription for search');
        const sub = resolvedNDK.subscribe(
            { kinds: [0], search: query },
            { closeOnEose: true, groupable: false, subId: 'user-search' },
            relaySet,
            false
        );

        activeSubscription = sub;

        sub.on('event', (event) => {
            console.log('[UserInput] Received event from relay search:', event.pubkey);
            const user = resolvedNDK.getUser({ pubkey: event.pubkey });

            const existingIndex = results.findIndex(r => r.user.pubkey === user.pubkey);
            if (existingIndex === -1) {
                console.log('[UserInput] Adding new user from relay search');
                const isFollowing = resolvedNDK.$follows.has(user.pubkey);
                if (isFollowing) {
                    results = [{ user }, ...results];
                } else {
                    results = [...results, { user }];
                }
            } else {
                console.log('[UserInput] User already in results from relay search');
            }
        });

        sub.on('eose', () => {
            console.log('[UserInput] Relay search EOSE, setting loading = false');
            loading = false;
        });

        console.log('[UserInput] Starting relay subscription');
        sub.start();
    }

    /**
     * Effect to watch query changes and trigger searches
     */
    $effect(() => {
        const { query, debounceMs = 300, relaySearch } = config();
        console.log('[UserInput] $effect triggered with query:', query, 'debounceMs:', debounceMs, 'relaySearch:', relaySearch);

        if (debounceTimer) {
            console.log('[UserInput] Clearing existing debounce timer');
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        if (activeSubscription) {
            console.log('[UserInput] Stopping existing relay subscription');
            activeSubscription.stop();
            activeSubscription = null;
        }

        console.log('[UserInput] Triggering immediate cache search');
        performCacheSearch(query);

        const isNip05 = NIP05_PATTERN.test(query);
        const isNpub = NPUB_PATTERN.test(query);

        console.log('[UserInput] Checking if debounced searches needed - isNip05:', isNip05, 'isNpub:', isNpub, 'hasRelaySearch:', !!relaySearch);

        if (isNip05 || isNpub || relaySearch) {
            console.log('[UserInput] Setting up debounced searches, delay:', debounceMs, 'ms');
            debounceTimer = setTimeout(() => {
                console.log('[UserInput] Debounce timer fired');

                if (isNip05 || isNpub) {
                    console.log('[UserInput] Performing network lookup');
                    performNetworkLookup(query);
                }

                if (relaySearch && relaySearch.length > 0) {
                    console.log('[UserInput] Performing relay search');
                    performRelaySearch(query, relaySearch);
                }
            }, debounceMs);
        } else {
            console.log('[UserInput] No debounced searches needed');
        }

        return () => {
            if (debounceTimer) {
                console.log('[UserInput] Cleanup: clearing debounce timer');
                clearTimeout(debounceTimer);
                debounceTimer = null;
            }
            if (activeSubscription) {
                console.log('[UserInput] Cleanup: stopping relay subscription');
                activeSubscription.stop();
                activeSubscription = null;
            }
        };
    });

    /**
     * Selects a user and calls the onSelect callback
     */
    function selectUser(user: NDKUser) {
        console.log('[UserInput] selectUser called with user:', user.npub);
        selectedUser = user;
        const { onSelect } = config();
        if (onSelect) {
            console.log('[UserInput] Calling onSelect callback');
            onSelect(user);
        } else {
            console.log('[UserInput] No onSelect callback provided');
        }
    }

    /**
     * Clears the current selection
     */
    function clear() {
        console.log('[UserInput] clear called');
        selectedUser = null;
        results = [];
        console.log('[UserInput] Cleared selectedUser and results');
    }

    return {
        get results() {
            return results;
        },
        get selectedUser() {
            return selectedUser;
        },
        get loading() {
            return loading;
        },
        selectUser,
        clear
    };
}
