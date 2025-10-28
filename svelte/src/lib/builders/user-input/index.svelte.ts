import type { Hexpubkey, NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '../../ndk-svelte.svelte.js';
import { resolveNDK } from '../resolve-ndk.svelte.js';

export interface UserInputResult {
    user: NDKUser;
    profile: NDKUserProfile | null;
    isFollowing: boolean;
}

export interface UserInputConfig {
    query: string;
    onSelect?: (user: NDKUser) => void;
    debounceMs?: number;
}

const NIP05_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NPUB_PATTERN = /^(npub1|nprofile1)[a-z0-9]{20,}/i;

/**
 * Creates a reactive user input search manager
 *
 * Searches cached profiles immediately and debounces NIP-05/npub/nprofile lookups.
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
 *     {result.profile?.name || result.user.npub}
 *   </button>
 * {/each}
 * ```
 */
export function createUserInput(
    config: () => UserInputConfig,
    ndk?: NDKSvelte
) {
    const resolvedNDK = resolveNDK(ndk);

    let results = $state<UserInputResult[]>([]);
    let selectedUser = $state<NDKUser | null>(null);
    let loading = $state(false);
    let debounceTimer = $state<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Searches cached profiles using the cache adapter's getProfiles method
     */
    async function searchCachedProfiles(query: string): Promise<UserInputResult[]> {
        if (!query.trim()) return [];

        const cacheAdapter = resolvedNDK.cacheAdapter;
        if (!cacheAdapter?.getProfiles) {
            // Fallback: search through all cached profiles
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
                    const user = resolvedNDK.getUser({ pubkey });
                    user.profile = profile;
                    matchedResults.push({
                        user,
                        profile,
                        isFollowing: resolvedNDK.$follows.has(pubkey)
                    });
                }
            }
            return matchedResults;
        }

        // Use cache adapter's getProfiles if available
        const profileMap = await cacheAdapter.getProfiles({
            fields: ['name', 'displayName', 'nip05', 'about'],
            contains: query
        });

        if (!profileMap) return [];

        return Array.from(profileMap.entries()).map(([pubkey, profile]) => {
            const user = resolvedNDK.getUser({ pubkey });
            user.profile = profile;
            return {
                user,
                profile,
                isFollowing: resolvedNDK.$follows.has(pubkey)
            };
        });
    }

    /**
     * Looks up user by NIP-05, npub, or nprofile
     */
    async function lookupUser(input: string): Promise<UserInputResult | null> {
        try {
            const user = await resolvedNDK.fetchUser(input);
            if (!user) return null;

            // Fetch profile if not cached
            if (!user.profile) {
                await user.fetchProfile({ closeOnEose: true, groupable: true, groupableDelay: 250 });
            }

            return {
                user,
                profile: user.profile || null,
                isFollowing: resolvedNDK.$follows.has(user.pubkey)
            };
        } catch (err) {
            console.error('Failed to lookup user:', err);
            return null;
        }
    }

    /**
     * Performs the search based on query type
     */
    async function performSearch(query: string) {
        if (!query.trim()) {
            results = [];
            loading = false;
            return;
        }

        loading = true;

        // Always search cached profiles immediately
        const cachedResults = await searchCachedProfiles(query);

        // Sort with followed users first
        cachedResults.sort((a, b) => {
            if (a.isFollowing && !b.isFollowing) return -1;
            if (!a.isFollowing && b.isFollowing) return 1;
            return 0;
        });

        results = cachedResults;

        // Check if query looks like NIP-05/npub/nprofile for network lookup
        const isNip05 = NIP05_PATTERN.test(query);
        const isNpub = NPUB_PATTERN.test(query);

        if (isNip05 || isNpub) {
            const lookupResult = await lookupUser(query);
            if (lookupResult) {
                // Check if this user is already in results
                const existingIndex = results.findIndex(r => r.user.pubkey === lookupResult.user.pubkey);
                if (existingIndex === -1) {
                    // Add to results, prioritizing at top if following
                    if (lookupResult.isFollowing) {
                        results = [lookupResult, ...results];
                    } else {
                        results = [...results, lookupResult];
                    }
                } else {
                    // Update existing entry with fetched profile
                    results[existingIndex] = lookupResult;
                }
            }
        }

        loading = false;
    }

    /**
     * Effect to watch query changes and trigger searches
     */
    $effect(() => {
        const { query, debounceMs = 300 } = config();

        // Clear any existing debounce timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        // Immediate cache search
        performSearch(query);

        // Debounce NIP-05/npub/nprofile lookups
        const isNip05 = NIP05_PATTERN.test(query);
        const isNpub = NPUB_PATTERN.test(query);

        if (isNip05 || isNpub) {
            debounceTimer = setTimeout(() => {
                performSearch(query);
            }, debounceMs);
        }
    });

    /**
     * Selects a user and calls the onSelect callback
     */
    function selectUser(user: NDKUser) {
        selectedUser = user;
        const { onSelect } = config();
        onSelect?.(user);
    }

    /**
     * Clears the current selection
     */
    function clear() {
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
