import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMintAnnouncement, NDKKind, NDKMintRecommendation, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { createStore } from "zustand/vanilla";

export interface MintMetadata {
    url: string;
    identifier?: string;
    network?: string;
    nuts: string[];
    name?: string;
    description?: string;
    icon?: string;
    longDescription?: string;
    contact?: {
        nostr?: string;
        email?: string;
    };
    motd?: string;
    recommendations: NDKMintRecommendation[];
    score: number;
    lastUpdated: number;
    isOnline?: boolean;
}

export interface MintDiscoveryOptions {
    network?: string;
    minRecommendations?: number;
    limit?: number;
    followUsers?: string[];
    timeout?: number;
}

export interface MintDiscoveryState {
    mints: MintMetadata[];
    progress: {
        announcementsFound: number;
        recommendationsFound: number;
    };
    getMint: (url: string) => MintMetadata | undefined;
    getTopMints: (limit?: number, minRecommendations?: number) => MintMetadata[];
    searchMints: (query: string) => MintMetadata[];
    recommendMint: (url: string, review: string) => Promise<void>;
    stop: () => void;
}

async function fetchMintInfo(
    url: string,
    ndk: NDK,
): Promise<{
    isOnline: boolean;
    info?: any;
}> {
    // Try cache first
    if (ndk.cacheAdapter?.getCacheData) {
        try {
            const cached = await ndk.cacheAdapter.getCacheData<any>("wallet:mint:info", url);
            if (cached) {
                return { isOnline: true, info: cached };
            }
        } catch (e) {
            console.error("Error reading mint info from cache:", e);
        }
    }

    // Cache miss, fetch from network
    try {
        const response = await fetch(`${url}/v1/info`);
        if (response.ok) {
            const info = await response.json();

            // Cache the result
            if (ndk.cacheAdapter?.setCacheData) {
                try {
                    await ndk.cacheAdapter.setCacheData("wallet:mint:info", url, info);
                } catch (e) {
                    console.error("Error caching mint info:", e);
                }
            }

            return { isOnline: true, info };
        }
        return { isOnline: false };
    } catch {
        return { isOnline: false };
    }
}

export function createMintDiscoveryStore(ndk: NDK, options: MintDiscoveryOptions = {}) {
    const { network = "mainnet", timeout = 10000, followUsers } = options;

    let mintSub: NDKSubscription | undefined;
    let recSub: NDKSubscription | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const mintsMap = new Map<string, MintMetadata>();

    const store = createStore<MintDiscoveryState>()((set, get) => ({
        mints: [],
        progress: {
            announcementsFound: 0,
            recommendationsFound: 0,
        },

        getMint: (url) => mintsMap.get(url),

        getTopMints: (limit = 10, minRecommendations = 0) => {
            let filtered = get().mints;

            if (minRecommendations > 0) {
                filtered = filtered.filter((m) => m.recommendations.length >= minRecommendations);
            }

            return filtered.sort((a, b) => b.score - a.score).slice(0, limit);
        },

        searchMints: (query) => {
            const lowerQuery = query.toLowerCase();
            return get().mints.filter(
                (mint) =>
                    mint.url.toLowerCase().includes(lowerQuery) ||
                    mint.name?.toLowerCase().includes(lowerQuery) ||
                    mint.description?.toLowerCase().includes(lowerQuery),
            );
        },

        recommendMint: async (url, review) => {
            const rec = new NDKMintRecommendation(ndk);
            rec.recommendedKind = NDKKind.CashuMintAnnouncement;
            rec.urls = [url];
            rec.review = review;
            await rec.sign();
            await rec.publish();
        },

        stop: () => {
            mintSub?.stop();
            recSub?.stop();
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        },
    }));

    // Subscribe to mint announcements (kind 38172)
    mintSub = ndk.subscribe(
        {
            kinds: [NDKKind.CashuMintAnnouncement],
            limit: 100,
        },
        {
            closeOnEose: false,
            onEvent: async (event) => {
        const mint = await NDKCashuMintAnnouncement.from(event);
        if (!mint) return;

        if (network && mint.network !== network) return;

        const url = mint.url;
        if (!url) return;

        // Add mint to store immediately
        const existing = mintsMap.get(url);
        const mintData: MintMetadata = {
            url,
            identifier: mint.identifier,
            network: mint.network,
            nuts: mint.nuts || [],
            name: mint.metadata?.name as string,
            description: mint.metadata?.description as string,
            icon: mint.metadata?.icon as string,
            longDescription: mint.metadata?.longDescription as string,
            contact: mint.metadata?.contact as any,
            motd: mint.metadata?.motd as string,
            recommendations: existing?.recommendations || [],
            score: existing?.score || 0,
            lastUpdated: Date.now(),
        };

        mintsMap.set(url, mintData);

        store.setState((state) => ({
            mints: Array.from(mintsMap.values()),
            progress: {
                ...state.progress,
                announcementsFound: state.progress.announcementsFound + 1,
            },
        }));

        // Fetch mint info in background and update reactively
        fetchMintInfo(url, ndk).then(({ isOnline, info }) => {
            const existing = mintsMap.get(url);
            if (!existing) return;

            mintsMap.set(url, {
                ...existing,
                isOnline,
                name: info?.name || existing.name,
                description: info?.description || existing.description,
                icon: info?.icon || existing.icon,
                longDescription: info?.longDescription || existing.longDescription,
                contact: info?.contact || existing.contact,
                motd: info?.motd || existing.motd,
                lastUpdated: Date.now(),
            });

            store.setState({ mints: Array.from(mintsMap.values()) });
        });
            },
        },
    );

    // Subscribe to recommendations (kind 38000)
    const recFilter: any = {
        kinds: [NDKKind.EcashMintRecommendation],
        "#k": [NDKKind.CashuMintAnnouncement.toString()],
        limit: 500,
    };

    if (followUsers && followUsers.length > 0) {
        recFilter.authors = followUsers;
    }

    recSub = ndk.subscribe(recFilter, {
        closeOnEose: false,
        onEvent: async (event) => {
        const rec = await NDKMintRecommendation.from(event);
        if (!rec) return;

        const urls = rec.urls;

        for (const url of urls) {
            const mint = mintsMap.get(url);

            if (mint) {
                mint.recommendations.push(rec);
                mint.score = mint.recommendations.length;
                mintsMap.set(url, { ...mint });
            } else {
                mintsMap.set(url, {
                    url,
                    nuts: [],
                    recommendations: [rec],
                    score: 1,
                    lastUpdated: Date.now(),
                });
            }

            store.setState((state) => ({
                mints: Array.from(mintsMap.values()),
                progress: {
                    ...state.progress,
                    recommendationsFound: state.progress.recommendationsFound + 1,
                },
            }));
        }
        },
    });

    // Auto-stop after timeout
    if (timeout > 0) {
        timeoutId = setTimeout(() => {
            store.getState().stop();
        }, timeout);
    }

    return store;
}
