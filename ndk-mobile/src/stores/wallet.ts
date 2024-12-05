import { NDKWallet, NDKWalletBalance } from "@nostr-dev-kit/ndk-wallet"
import { create } from "zustand"

interface WalletState {
    activeWallet: NDKWallet | undefined
    setActiveWallet: (wallet: NDKWallet) => void

    balances: NDKWalletBalance[],
    setBalances: (balances: NDKWalletBalance[]) => void
}

export const useWalletStore = create<WalletState>((set) => ({
    activeWallet: undefined,
    setActiveWallet: (wallet: NDKWallet) => set({ activeWallet: wallet }),

    balances: [],
    setBalances: (balances) => {
        console.log('Setting balances to:', balances);
        set({ balances });
    },
}))