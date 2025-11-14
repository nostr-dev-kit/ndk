import type { NDKUser, NDKSubscription } from '@nostr-dev-kit/ndk';
import { NDKRelaySet } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getNDK } from '../../utils/ndk/index.svelte.js';

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
): {
    readonly results: UserInputResult[];
    readonly selectedUser: NDKUser | null;
    readonly loading: boolean;
    selectUser: (user: NDKUser) => void;
    clear: () => void;
} {
    const ndk = getNDK(ndk);

    let results = $state<UserInputResult[]>([]);
    let selectedUser = $state<NDKUser | null>(null);
    let loading = $state(false);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let activeSubscription: NDKSubscription | null = null;

    /**
     * Searches cached profiles to find matching users
     */
    async function searchCachedProfiles(query: string): Promise<UserInputResult[]> {
        if (!query.trim()) {
            return [];
        }

        const cacheAdapter = ndk.cacheAdapter;

        if (!cacheAdapter?.getProfiles) {
            const allProfiles = cacheAdapter?.getAllProfilesSync?.() || new Map();

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
                    const user = ndk.getUser({ pubkey });
                    matchedResults.push({ user });
                }
            }
            return matchedResults;
        }

        const profileMap = await cacheAdapter.getProfiles({
            fields: ['name', 'displayName', 'nip05', 'about'],
            contains: query
        });

        if (!profileMap) {
            return [];
        }

        const results = Array.from(profileMap.keys()).map((pubkey) => ({
            user: ndk.getUser({ pubkey })
        }));

        return results;
    }

    /**
     * Looks up user by NIP-05, npub, or nprofile
     */
    async function lookupUser(input: string): Promise<UserInputResult | null> {
        try {
            const user = await ndk.fetchUser(input);
            if (!user) {
                return null;
            }

            return { user };
        } catch (err) {
            return null;
        }
    }

    /**
     * Performs cache search
     */
    async function performCacheSearch(query: string): Promise<void> {
        if (!query.trim()) {
            results = [];
            return;
        }

        const cachedResults = await searchCachedProfiles(query);

        cachedResults.sort((a, b) => {
            const aFollowing = ndk.$follows.has(a.user.pubkey);
            const bFollowing = ndk.$follows.has(b.user.pubkey);
            if (aFollowing && !bFollowing) return -1;
            if (!aFollowing && bFollowing) return 1;
            return 0;
        });

        results = cachedResults;
    }

    /**
     * Performs network lookup for NIP-05/npub/nprofile
     */
    async function performNetworkLookup(query: string): Promise<void> {
        loading = true;

        const lookupResult = await lookupUser(query);
        if (lookupResult) {
            const existingIndex = results.findIndex(r => r.user.pubkey === lookupResult.user.pubkey);

            if (existingIndex === -1) {
                const isFollowing = ndk.$follows.has(lookupResult.user.pubkey);
                if (isFollowing) {
                    results = [lookupResult, ...results];
                } else {
                    results = [...results, lookupResult];
                }
            } else {
                results[existingIndex] = lookupResult;
            }
        }

        loading = false;
    }

    /**
     * Performs NIP-50 relay search
     */
    function performRelaySearch(query: string, relays: string[]): void {
        if (activeSubscription) {
            activeSubscription.stop();
            activeSubscription = null;
        }

        if (!query.trim() || relays.length === 0) {
            return;
        }

        loading = true;

        const relayInstances = relays.map(url => ndk.pool.getRelay(url, true, true));
        const relaySet = new NDKRelaySet(new Set(relayInstances), ndk);

        const sub = ndk.subscribe(
            { kinds: [0], search: query },
            { closeOnEose: true, groupable: false, subId: 'user-search' },
            relaySet,
            false
        );

        activeSubscription = sub;

        sub.on('event', (event) => {
            const user = ndk.getUser({ pubkey: event.pubkey });

            const existingIndex = results.findIndex(r => r.user.pubkey === user.pubkey);
            if (existingIndex === -1) {
                const isFollowing = ndk.$follows.has(user.pubkey);
                if (isFollowing) {
                    results = [{ user }, ...results];
                } else {
                    results = [...results, { user }];
                }
            }
        });

        sub.on('eose', () => {
            loading = false;
        });

        sub.start();
    }

    /**
     * Effect to watch query changes and trigger searches
     */
    $effect(() => {
        const { query, debounceMs = 300, relaySearch } = config();

        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        if (activeSubscription) {
            activeSubscription.stop();
            activeSubscription = null;
        }

        performCacheSearch(query);

        const isNip05 = NIP05_PATTERN.test(query);
        const isNpub = NPUB_PATTERN.test(query);

        if (isNip05 || isNpub || relaySearch) {
            debounceTimer = setTimeout(() => {
                if (isNip05 || isNpub) {
                    performNetworkLookup(query);
                }

                if (relaySearch && relaySearch.length > 0) {
                    performRelaySearch(query, relaySearch);
                }
            }, debounceMs);
        }

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
                debounceTimer = null;
            }
            if (activeSubscription) {
                activeSubscription.stop();
                activeSubscription = null;
            }
        };
    });

    /**
     * Selects a user and calls the onSelect callback
     */
    function selectUser(user: NDKUser): void {
        selectedUser = user;
        const { onSelect } = config();
        if (onSelect) {
            onSelect(user);
        }
    }

    /**
     * Clears the current selection
     */
    function clear(): void {
        selectedUser = null;
        results = [];
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
