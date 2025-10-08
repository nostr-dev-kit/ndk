import type { NDKNutzapMonitor, NDKWallet, NDKWalletBalance } from "@nostr-dev-kit/wallet";
import { create } from "zustand";

interface WalletState {
    activeWallet: NDKWallet | undefined;
    setActiveWallet: (wallet: NDKWallet) => void;

    balance: NDKWalletBalance;
    setBalance: (balance: NDKWalletBalance) => void;

    nutzapMonitor: NDKNutzapMonitor | undefined;
    setNutzapMonitor: (monitor: NDKNutzapMonitor) => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
    activeWallet: undefined,
    setActiveWallet: (wallet: NDKWallet) => set({ activeWallet: wallet }),

    balance: null,
    setBalance: (balance) => {
        set({ balance });
    },

    nutzapMonitor: undefined,
    setNutzapMonitor: (monitor: NDKNutzapMonitor) => set({ nutzapMonitor: monitor }),
}));
