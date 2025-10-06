import { type NDKCashuMintList, NDKKind, type NDKNutzap } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet, NDKNutzapMonitor, type NDKNutzapMonitorStore } from "@nostr-dev-kit/wallet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { useNDK, useNDKCurrentUser } from "../../ndk/hooks";

/**
 * Hook to manage the user's NDK Cashu Wallet instance and its balance.
 * Automatically loads the wallet from the user's NIP-60 events.
 */
export const useNDKWallet = () => {
    const { ndk } = useNDK();
    const currentUser = useNDKCurrentUser();
    const [wallet, setWallet] = useState(null as NDKCashuWallet | null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null as Error | null);

    // Load wallet from user's events on mount
    useEffect(() => {
        if (!ndk || !currentUser?.pubkey) {
            setLoading(false);
            return;
        }

        const loadWallet = async () => {
            try {
                setLoading(true);
                setError(null);

                const event = await ndk.fetchEvent({
                    kinds: [NDKKind.CashuWallet],
                    authors: [currentUser.pubkey],
                });

                if (event) {
                    const w = await NDKCashuWallet.from(event);
                    if (w) {
                        setWallet(w);
                        ndk.wallet = w;
                        await w.start();
                    }
                } else {
                    // No wallet found - this is not an error, user just hasn't created one yet
                    setWallet(null);
                }
            } catch (e) {
                console.error("Failed to load wallet:", e);
                setError(e as Error);
            } finally {
                setLoading(false);
            }
        };

        loadWallet();
    }, [ndk, currentUser?.pubkey]);

    // React to wallet balance changes
    useEffect(() => {
        if (!wallet) {
            setBalance(0);
            return;
        }

        const updateBalance = () => {
            const amount = wallet.balance?.amount ?? 0;
            setBalance(amount);
        };

        // Initial balance
        updateBalance();

        // Listen for updates
        wallet.on("balance_updated", updateBalance);
        wallet.on("ready", updateBalance);

        return () => {
            wallet.off("balance_updated", updateBalance);
            wallet.off("ready", updateBalance);
        };
    }, [wallet]);

    return { wallet, balance, loading, error };
};

// Singleton store for nutzap monitor to prevent duplicate monitors
interface NutzapMonitorHookState {
    nutzapMonitor: NDKNutzapMonitor | null;
    setNutzapMonitor: (monitor: NDKNutzapMonitor | null) => void;
}

const useInternalNutzapMonitorStore = create<NutzapMonitorHookState>((set) => ({
    nutzapMonitor: null,
    setNutzapMonitor: (monitor) => set({ nutzapMonitor: monitor }),
}));

/**
 * Hook to manage and interact with the NDKNutzapMonitor.
 * Uses a singleton pattern to prevent duplicate monitors from competing for nutzaps.
 * The monitor will use the wallet's published mint list (kind:10019) for configuration.
 */
export const useNutzapMonitor = () => {
    const { ndk } = useNDK();
    const currentUser = useNDKCurrentUser();
    const { wallet } = useNDKWallet();
    const nutzapMonitor = useInternalNutzapMonitorStore((s) => s.nutzapMonitor);
    const setNutzapMonitor = useInternalNutzapMonitorStore((s) => s.setNutzapMonitor);

    const [nutzaps, setNutzaps] = useState([] as NDKNutzap[]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [error, setError] = useState(null as Error | null);

    const monitorStore = useMemo((): NDKNutzapMonitorStore | undefined => {
        if (ndk?.cacheAdapter?.getAllNutzapStates && ndk?.cacheAdapter?.setNutzapState) {
            const boundGetAll = ndk.cacheAdapter.getAllNutzapStates.bind(ndk.cacheAdapter);
            const boundSetState = ndk.cacheAdapter.setNutzapState.bind(ndk.cacheAdapter);
            return {
                getAllNutzaps: boundGetAll,
                setNutzapState: boundSetState,
            };
        }
        return undefined;
    }, [ndk?.cacheAdapter]);

    // Create or update singleton monitor when wallet changes
    useEffect(() => {
        if (!ndk || !currentUser || !wallet) {
            if (nutzapMonitor) {
                nutzapMonitor.stop();
                setNutzapMonitor(null);
                setIsMonitoring(false);
            }
            return;
        }

        // Create new monitor only if needed
        if (!nutzapMonitor || nutzapMonitor.wallet !== wallet) {
            const monitor = new NDKNutzapMonitor(ndk, currentUser, {
                store: monitorStore,
            });
            monitor.wallet = wallet;

            // Get mintList from wallet if available
            if ("mintList" in wallet && wallet.mintList) {
                monitor.mintList = wallet.mintList as NDKCashuMintList;
            }

            setNutzapMonitor(monitor);
        }
    }, [ndk, currentUser, wallet, monitorStore, nutzapMonitor, setNutzapMonitor]);

    // Listen for nutzaps
    useEffect(() => {
        if (!nutzapMonitor) return;

        const handleSeen = (nutzap: NDKNutzap) => {
            setNutzaps((prev: NDKNutzap[]) => [...prev, nutzap]);
        };

        const handleRedeemed = (nutzaps: NDKNutzap[]) => {
            // Remove redeemed nutzaps from the list
            const redeemedIds = new Set(nutzaps.map((n) => n.id));
            setNutzaps((prev: NDKNutzap[]) => prev.filter((n) => !redeemedIds.has(n.id)));
        };

        nutzapMonitor.on("seen", handleSeen);
        nutzapMonitor.on("redeemed", handleRedeemed);

        return () => {
            nutzapMonitor.off("seen", handleSeen);
            nutzapMonitor.off("redeemed", handleRedeemed);
        };
    }, [nutzapMonitor]);

    // Explicit control methods
    const start = useCallback(async () => {
        if (!nutzapMonitor) {
            setError(new Error("No monitor initialized - wallet not loaded"));
            return;
        }
        try {
            setError(null);
            await nutzapMonitor.start({
                filter: { limit: 100 },
                opts: { skipVerification: true },
            });
            setIsMonitoring(true);
        } catch (e) {
            console.error("Failed to start nutzap monitor:", e);
            setError(e as Error);
            setIsMonitoring(false);
        }
    }, [nutzapMonitor]);

    const stop = useCallback(() => {
        if (nutzapMonitor) {
            nutzapMonitor.stop();
            setIsMonitoring(false);
        }
    }, [nutzapMonitor]);

    return {
        nutzaps,
        isMonitoring,
        error,
        start,
        stop,
    };
};

// Export the old name with deprecation notice for backwards compatibility
export const useNDKNutzapMonitor = useNutzapMonitor;
