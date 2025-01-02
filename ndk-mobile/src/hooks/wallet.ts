import { NDKWallet } from '@nostr-dev-kit/ndk-wallet';
import { useWalletStore } from '../stores/wallet';
import { useNDK } from './ndk';
import { useNDKStore } from '../stores/ndk';

const useNDKWallet = () => {
    const { ndk } = useNDK();
    const settingsStore = useNDKStore(s => s.settingsStore);
    const activeWallet = useWalletStore(s => s.activeWallet);
    const storeSetActiveWallet = useWalletStore(s => s.setActiveWallet);
    const balances = useWalletStore(s => s.balances);
    const setBalances = useWalletStore(s => s.setBalances);
    const nutzapMonitor = useWalletStore(s => s.nutzapMonitor);
    const setNutzapMonitor = useWalletStore(s => s.setNutzapMonitor);

    const setActiveWallet = (wallet: NDKWallet) => {
        storeSetActiveWallet(wallet);
        ndk.wallet = wallet;

        let loadingString: string | undefined;
        
        if (wallet) loadingString = wallet.toLoadingString?.();
        if (loadingString) 
            settingsStore.set('wallet', loadingString);
        else
            settingsStore.delete('wallet');
    }

    return { activeWallet, setActiveWallet, balances, setBalances, nutzapMonitor, setNutzapMonitor };
}

export {
    useNDKWallet,
}