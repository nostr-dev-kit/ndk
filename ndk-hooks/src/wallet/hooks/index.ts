import type { NDKCashuMintList } from "@nostr-dev-kit/ndk";
import type { NDKWallet } from "@nostr-dev-kit/ndk-wallet";
import { NDKNutzapMonitor, type NDKNutzapMonitorStore } from "@nostr-dev-kit/ndk-wallet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { useNDK, useNDKCurrentUser } from "../../ndk/hooks";

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

    const setActiveWallet = useCallback(
        (wallet: NDKWallet | null) => {
            if (!ndk) return;
            let debounceTimer: number | NodeJS.Timeout | undefined;

            storeSetActiveWallet(wallet);
            ndk.wallet = wallet ?? undefined;

            const updateBalance = () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const balanceObj = wallet?.balance;
                    const amount = balanceObj?.amount ?? null;
                    setBalance(amount);
                }, 50);
            };

            if (wallet) {
                wallet.on("ready", updateBalance);
                wallet.on("balance_updated", updateBalance);
                wallet.updateBalance?.();
            } else {
                setBalance(null);
            }
        },
        [ndk, storeSetActiveWallet, setBalance],
    );

    return { activeWallet, setActiveWallet, balance, setBalance };
};

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
    const currentUser = useNDKCurrentUser();
    const { activeWallet } = useNDKWallet();
    const nutzapMonitor = useInternalNutzapMonitorStore((s) => s.nutzapMonitor);
    const setNutzapMonitor = useInternalNutzapMonitorStore((s) => s.setNutzapMonitor);
    const [monitorStarted, setMonitorStarted] = useState(false);

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

    useEffect(() => {
        if (!ndk || !currentUser?.pubkey || !activeWallet) {
            if (nutzapMonitor) {
                nutzapMonitor.stop();
                setNutzapMonitor(null);
                setMonitorStarted(false);
            }
            return;
        }

        if (!nutzapMonitor && start) {
            const monitor = new NDKNutzapMonitor(ndk, currentUser, {
                mintList,
                store: monitorStore,
            });
            monitor.wallet = activeWallet;
            setNutzapMonitor(monitor);
        } else if (nutzapMonitor) {
            if (nutzapMonitor.wallet?.walletId !== activeWallet.walletId) {
                nutzapMonitor.wallet = activeWallet;
            }
            if (nutzapMonitor.mintList !== mintList) {
                nutzapMonitor.mintList = mintList;
            }
        }
    }, [ndk, currentUser, activeWallet, mintList, monitorStore, nutzapMonitor, setNutzapMonitor, start]);

    useEffect(() => {
        if (start && nutzapMonitor && !monitorStarted) {
            nutzapMonitor
                .start({
                    filter: { limit: 100 },
                    opts: { skipVerification: true },
                })
                .then(() => {
                    setMonitorStarted(true);
                })
                .catch((err: Error) => {
                    console.error("Failed to start NDKNutzapMonitor", err);
                });
        } else if (!start && nutzapMonitor && monitorStarted) {
            nutzapMonitor.stop();
            setMonitorStarted(false);
        }

        return () => {
            if (nutzapMonitor && monitorStarted) {
                nutzapMonitor.stop();
                setMonitorStarted(false);
            }
        };
    }, [start, nutzapMonitor, monitorStarted]);

    return { nutzapMonitor };
};
