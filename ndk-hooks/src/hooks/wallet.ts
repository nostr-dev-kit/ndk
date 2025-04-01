// This file will contain the migrated wallet-related hooks
import NDK from "@nostr-dev-kit/ndk";
import type { NDKWallet } from "@nostr-dev-kit/ndk-wallet";
import { useCallback } from "react";
import { create } from 'zustand'; // Assuming zustand is used for state management in ndk-hooks
import { useNDK } from "./ndk"; // Assuming useNDK exists in ndk-hooks

// Define a simple zustand store for wallet state within ndk-hooks
// This replaces the dependency on ndk-mobile's useWalletStore
interface WalletHookState {
    activeWallet: NDKWallet | null;
    balance: number | null;
    setActiveWallet: (wallet: NDKWallet | null) => void;
    setBalance: (balance: number | null) => void;
}

const useInternalWalletStore = create<WalletHookState>((set) => ({
    activeWallet: null,
    balance: null,
    setActiveWallet: (wallet) => set({ activeWallet: wallet }),
    setBalance: (balance) => set({ balance: balance }),
}));


/**
 * Hook to manage the active NDK Wallet instance and its balance.
 */
export const useNDKWallet = () => {
    const { ndk } = useNDK();
    const activeWallet = useInternalWalletStore((s) => s.activeWallet);
    const storeSetActiveWallet = useInternalWalletStore((s) => s.setActiveWallet);
    const balance = useInternalWalletStore((s) => s.balance);
    const setBalance = useInternalWalletStore((s) => s.setBalance);

    // Note: Persisting wallet update time is removed as it was tied to mobile's settingsStore

    const setActiveWallet = useCallback(
        (wallet: NDKWallet | null) => { // Allow null to unset wallet
            if (!ndk) return;
            let debounceTimer: NodeJS.Timeout | undefined;

            storeSetActiveWallet(wallet);
            ndk.wallet = wallet ?? undefined; // Set ndk.wallet, handle null

            const updateBalance = () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const balanceObj = wallet?.balance;
                    const amount = balanceObj?.amount ?? null; // Extract amount, default to null
                    setBalance(amount);
                }, 50);
            };

            // Clean up previous listeners if wallet changes
            // This part might need refinement depending on how NDKWallet handles listeners
            // For simplicity, assuming NDKWallet manages its own listener cleanup or ndk.wallet reassignment handles it.

            if (wallet) {
                // Re-attach listeners for the new wallet
                wallet.on("ready", updateBalance); // Removed storeLastUpdatedAt call
                wallet.on("balance_updated", updateBalance);
                wallet.updateBalance?.(); // Initial balance update
            } else {
                 setBalance(null); // Clear balance when wallet is unset
            }
        },
        [ndk, storeSetActiveWallet, setBalance] // Dependencies updated
    );

    return { activeWallet, setActiveWallet, balance, setBalance };
};



import { NDKNutzapMonitor, type NDKNutzapMonitorStore } from "@nostr-dev-kit/ndk-wallet";
import type { NDKCashuMintList, NDKUser } from "@nostr-dev-kit/ndk";
import { useEffect, useMemo, useState } from "react";
import { useNDKCurrentUser } from "./ndk"; // Assuming this hook exists

// Define a simple zustand store for nutzap monitor state within ndk-hooks
// This replaces the dependency on ndk-mobile's useWalletStore for the monitor instance
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
 * It initializes the monitor based on the current user and active wallet,
 * using the generic NDK cache adapter for persistence if available.
 *
 * @param mintList - Optional mint list for the monitor.
 * @param start - Whether to automatically start the monitor.
 */
export const useNDKNutzapMonitor = (mintList?: NDKCashuMintList, start = false) => {
    const { ndk } = useNDK();
    const currentUser = useNDKCurrentUser(); // Use the hook from ndk-hooks
    const { activeWallet } = useNDKWallet(); // Use the wallet hook defined above
    const nutzapMonitor = useInternalNutzapMonitorStore((s) => s.nutzapMonitor);
    const setNutzapMonitor = useInternalNutzapMonitorStore((s) => s.setNutzapMonitor);
    const [monitorStarted, setMonitorStarted] = useState(false);

    // Create the store object from the cache adapter if methods exist
    const monitorStore = useMemo((): NDKNutzapMonitorStore | undefined => {
        if (ndk?.cacheAdapter?.getAllNutzapStates && ndk?.cacheAdapter?.setNutzapState) {
            // Need to bind `this` correctly to the cacheAdapter instance
            const boundGetAll = ndk.cacheAdapter.getAllNutzapStates.bind(ndk.cacheAdapter);
            const boundSetState = ndk.cacheAdapter.setNutzapState.bind(ndk.cacheAdapter);
            return {
                getAllNutzaps: boundGetAll,
                setNutzapState: boundSetState,
            };
        }
        return undefined;
    }, [ndk?.cacheAdapter]);

    useEffect(() => {
        // Conditions to initialize or update the monitor
        if (!ndk || !currentUser?.pubkey || !activeWallet) {
            // If essential components are missing, ensure monitor is stopped/cleared
            if (nutzapMonitor) {
                nutzapMonitor.stop();
                setNutzapMonitor(null);
                setMonitorStarted(false);
            }
            return;
        }

        // Initialize monitor if it doesn't exist
        if (!nutzapMonitor) {
            console.log("Initializing NDKNutzapMonitor");
            const monitor = new NDKNutzapMonitor(ndk, currentUser, {
                mintList,
                store: monitorStore, // Use the store derived from cacheAdapter
            });
            monitor.wallet = activeWallet; // Set the wallet immediately
            setNutzapMonitor(monitor);
            // Don't start automatically here, wait for the 'start' flag effect
        } else {
            // Update existing monitor if wallet or mintList changes
            if (nutzapMonitor.wallet?.walletId !== activeWallet.walletId) {
                 console.log("Updating wallet in NDKNutzapMonitor");
                 nutzapMonitor.wallet = activeWallet;
            }
            if (nutzapMonitor.mintList !== mintList) {
                 console.log("Updating mintList in NDKNutzapMonitor");
                 nutzapMonitor.mintList = mintList;
                 // Potentially restart or reconfigure monitor if mintList changes significantly?
            }
        }

    }, [ndk, currentUser, activeWallet, mintList, monitorStore, nutzapMonitor, setNutzapMonitor]);


    // Effect specifically for starting the monitor
    useEffect(() => {
        if (start && nutzapMonitor && !monitorStarted) {
            console.log("Starting NDKNutzapMonitor");
            nutzapMonitor.start({
                filter: { limit: 100 }, // Consider making filter/opts configurable
                opts: { skipVerification: true },
            }).then(() => {
                setMonitorStarted(true);
                console.log("NDKNutzapMonitor started successfully");
            }).catch((err: Error) => { // Add explicit type for err
                console.error("Failed to start NDKNutzapMonitor", err);
                // Optionally reset monitor state here if start fails critically
            });
        } else if (!start && nutzapMonitor && monitorStarted) {
            console.log("Stopping NDKNutzapMonitor");
            nutzapMonitor.stop();
            setMonitorStarted(false);
        }

        // Cleanup function to stop monitor when component unmounts or conditions change
        return () => {
            if (nutzapMonitor && monitorStarted) {
                 console.log("Stopping NDKNutzapMonitor on cleanup");
                 nutzapMonitor.stop();
                 setMonitorStarted(false); // Reset started state on cleanup
            }
        };
    }, [start, nutzapMonitor, monitorStarted]); // Depend on start flag and monitor instance

    return { nutzapMonitor }; // Only return the monitor instance
};
// useNDKNutzapMonitor will be added in the next step