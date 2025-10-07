import { create } from "zustand";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMint, NDKMintRecommendation, NDKKind, type NDKSubscription } from "@nostr-dev-kit/ndk";

export interface MintMetadata {
    // Basic info
    url: string;
    identifier?: string;
    network?: string;

    // NUT support (from kind 38172)
    nuts: string[]; // e.g., ["NUT-00", "NUT-01", "NUT-03", "NUT-04"]

    // Display info (from metadata field)
    name?: string;
    description?: string;
    icon?: string;
    longDescription?: string;

    // Contact/support
    contact?: {
        nostr?: string;
        email?: string;
    };

    // Mint info
    motd?: string; // Message of the day

    // Recommendations
    recommendations: MintRecommendation[];
    score: number;

    // Discovery metadata
    lastUpdated: number;
    isOnline?: boolean;
}

export interface MintRecommendation {
    pubkey: string;
    npub: string;
    review: string;
    createdAt: number;
}

export interface MintDiscoveryOptions {
    /**
     * Network to filter by (mainnet, testnet, etc.)
     */
    network?: string;

    /**
     * Minimum number of recommendations to include
     */
    minRecommendations?: number;

    /**
     * Maximum number of mints to return
     */
    limit?: number;

    /**
     * Follow recommendations from specific users
     */
    followUsers?: string[];

    /**
     * Timeout for discovery in milliseconds
     */
    timeout?: number;
}

export interface MintDiscoveryState {
    // State
    mints: Map<string, MintMetadata>;
    isDiscovering: boolean;
    progress: {
        announcementsFound: number;
        recommendationsFound: number;
        mintsProcessed: number;
    };

    // Internal subscription refs
    _mintSub?: NDKSubscription;
    _recSub?: NDKSubscription;
    _timeout?: ReturnType<typeof setTimeout>;

    // Filters
    filters: {
        network?: string;
        minRecommendations?: number;
        requiredNuts?: string[];
    };

    // Actions
    startDiscovery: (options?: MintDiscoveryOptions) => void;
    stopDiscovery: () => void;

    // Mint management
    getMint: (url: string) => MintMetadata | undefined;
    getTopMints: (limit?: number) => MintMetadata[];
    searchMints: (query: string) => MintMetadata[];

    // Filtering
    setFilters: (filters: Partial<MintDiscoveryState["filters"]>) => void;
    clearFilters: () => void;

    // Mint info
    refreshMintInfo: (url: string) => Promise<void>;
    checkMintOnline: (url: string) => Promise<boolean>;

    // Recommendations
    recommendMint: (url: string, review: string) => Promise<void>;

    // Reset
    reset: () => void;
}

export function createMintDiscoveryStore(ndk: NDK) {
    return create<MintDiscoveryState>((set, get) => ({
        mints: new Map(),
        isDiscovering: false,
        progress: {
            announcementsFound: 0,
            recommendationsFound: 0,
            mintsProcessed: 0,
        },
        filters: {},

        startDiscovery: (options = {}) => {
            // Clean up any existing discovery
            get().stopDiscovery();

            set({
                isDiscovering: true,
                progress: {
                    announcementsFound: 0,
                    recommendationsFound: 0,
                    mintsProcessed: 0,
                },
            });

            const { network = "mainnet", timeout = 10000, followUsers } = options;

            // Subscribe to mint announcements (kind 38172)
            const mintSub = ndk.subscribe(
                {
                    kinds: [NDKKind.CashuMintAnnouncement],
                    limit: 100,
                },
                { closeOnEose: false }
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

            const recSub = ndk.subscribe(recFilter, { closeOnEose: false });

            // Process mint announcements as they arrive
            mintSub.on("event", async (event) => {
                const mint = await NDKCashuMint.from(event);
                if (!mint) return;

                // Filter by network if specified
                if (network && mint.network !== network) return;

                const url = mint.url;
                if (!url) return;

                set((state) => {
                    const existing = state.mints.get(url);

                    state.mints.set(url, {
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
                    });

                    return {
                        mints: new Map(state.mints),
                        progress: {
                            ...state.progress,
                            announcementsFound: state.progress.announcementsFound + 1,
                        },
                    };
                });
            });

            // Process recommendations as they arrive
            recSub.on("event", async (event) => {
                const rec = await NDKMintRecommendation.from(event);
                if (!rec) return;

                const urls = rec.urls;

                for (const url of urls) {
                    set((state) => {
                        const mint = state.mints.get(url);

                        const recommendation: MintRecommendation = {
                            pubkey: rec.pubkey,
                            npub: rec.author?.npub || "",
                            review: rec.review,
                            createdAt: rec.created_at || 0,
                        };

                        if (mint) {
                            // Mint already exists - add recommendation
                            mint.recommendations.push(recommendation);
                            mint.score = mint.recommendations.length;
                            state.mints.set(url, { ...mint });
                        } else {
                            // Create placeholder mint from recommendation
                            state.mints.set(url, {
                                url,
                                nuts: [],
                                recommendations: [recommendation],
                                score: 1,
                                lastUpdated: Date.now(),
                            });
                        }

                        return {
                            mints: new Map(state.mints),
                            progress: {
                                ...state.progress,
                                recommendationsFound: state.progress.recommendationsFound + 1,
                            },
                        };
                    });
                }
            });

            // Store subscription refs for cleanup
            const timeoutId = setTimeout(() => {
                if (get().isDiscovering) {
                    get().stopDiscovery();
                }
            }, timeout);

            set({
                _mintSub: mintSub,
                _recSub: recSub,
                _timeout: timeoutId,
            });
        },

        stopDiscovery: () => {
            const state = get();
            state._mintSub?.stop();
            state._recSub?.stop();
            if (state._timeout) {
                clearTimeout(state._timeout);
            }
            set({
                isDiscovering: false,
                _mintSub: undefined,
                _recSub: undefined,
                _timeout: undefined,
            });
        },

        getMint: (url) => get().mints.get(url),

        getTopMints: (limit = 10) => {
            const { mints, filters } = get();
            let filtered = Array.from(mints.values());

            // Apply filters
            if (filters.minRecommendations !== undefined) {
                filtered = filtered.filter((m) => m.recommendations.length >= filters.minRecommendations!);
            }

            if (filters.requiredNuts && filters.requiredNuts.length > 0) {
                filtered = filtered.filter((m) => m.nuts && Array.isArray(m.nuts) && filters.requiredNuts!.every((nut) => m.nuts.includes(nut)));
            }

            return filtered.sort((a, b) => b.score - a.score).slice(0, limit);
        },

        searchMints: (query) => {
            const lowerQuery = query.toLowerCase();
            return Array.from(get().mints.values()).filter(
                (mint) =>
                    mint.url.toLowerCase().includes(lowerQuery) ||
                    mint.name?.toLowerCase().includes(lowerQuery) ||
                    mint.description?.toLowerCase().includes(lowerQuery)
            );
        },

        setFilters: (filters) => {
            set((state) => ({ filters: { ...state.filters, ...filters } }));
        },

        clearFilters: () => {
            set({ filters: {} });
        },

        refreshMintInfo: async (url) => {
            const events = await ndk.fetchEvents({
                kinds: [NDKKind.CashuMintAnnouncement],
                "#u": [url],
            });

            if (events.size > 0) {
                const event = Array.from(events)[0];
                const mint = await NDKCashuMint.from(event);

                if (mint && mint.url) {
                    set((state) => {
                        const existing = state.mints.get(mint.url!);

                        state.mints.set(mint.url!, {
                            url: mint.url!,
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
                        });

                        return { mints: new Map(state.mints) };
                    });
                }
            }
        },

        checkMintOnline: async (url) => {
            try {
                // Check mint /v1/info endpoint
                const response = await fetch(`${url}/v1/info`);
                const isOnline = response.ok;

                // Update mint status
                set((state) => {
                    const mint = state.mints.get(url);
                    if (mint) {
                        state.mints.set(url, { ...mint, isOnline, lastUpdated: Date.now() });
                    }
                    return { mints: new Map(state.mints) };
                });

                return isOnline;
            } catch {
                return false;
            }
        },

        recommendMint: async (url, review) => {
            const rec = new NDKMintRecommendation(ndk);
            rec.recommendedKind = NDKKind.CashuMintAnnouncement;
            rec.urls = [url];
            rec.review = review;
            await rec.sign();
            await rec.publish();
        },

        reset: () => {
            get().stopDiscovery();
            set({
                mints: new Map(),
                isDiscovering: false,
                progress: {
                    announcementsFound: 0,
                    recommendationsFound: 0,
                    mintsProcessed: 0,
                },
                filters: {},
            });
        },
    }));
}
