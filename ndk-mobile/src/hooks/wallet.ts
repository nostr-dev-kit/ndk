import { NDKCashuWallet, NDKNutzapMonitor, NDKWallet } from '@nostr-dev-kit/ndk-wallet';
import { useWalletStore } from '../stores/wallet';
import { useNDK, useNDKCurrentUser } from './ndk';
import { useNDKStore } from '../stores/ndk';
import { useEffect, useCallback } from 'react';

/**
 * @param start - Whether to start the nutzap monitor if it hasn't been started yet.
 * @returns 
 */
const useNDKNutzapMonitor = (start: boolean = true) => {
    const { ndk } = useNDK();
    const nutzapMonitor = useWalletStore(s => s.nutzapMonitor);
    const setNutzapMonitor = useWalletStore(s => s.setNutzapMonitor);
    const currentUser = useNDKCurrentUser();
    const activeWallet = useWalletStore(s => s.activeWallet);

    useEffect(() => {
        if (!start) return;
        if (!ndk) return;
        if (!currentUser?.pubkey) return;
        if (!activeWallet?.walletId) return;
        if (nutzapMonitor) return;

        const monitor = new NDKNutzapMonitor(ndk, currentUser);
        console.log("[NDK-WALLET] Starting nutzap monitor");
        setNutzapMonitor(monitor);
        if (activeWallet instanceof NDKCashuWallet) monitor.addWallet(activeWallet);
        monitor.start();
    }, [ nutzapMonitor, setNutzapMonitor, activeWallet?.walletId, currentUser?.pubkey, ndk, start ])
    
    return { nutzapMonitor, setNutzapMonitor };
}

const useNDKWallet = () => {
    const { ndk } = useNDK();
    const settingsStore = useNDKStore(s => s.settingsStore);
    const activeWallet = useWalletStore(s => s.activeWallet);
    const storeSetActiveWallet = useWalletStore(s => s.setActiveWallet);
    const balance = useWalletStore(s => s.balance);
    const setBalance = useWalletStore(s => s.setBalance);

    const storeLastUpdatedAt = useCallback((wallet: NDKWallet) => {
        if (!(wallet instanceof NDKCashuWallet)) return;
        const now = Math.floor(Date.now()/1000);
        settingsStore.set('wallet_'+wallet.walletId+'_last_updated_at', now.toString());
        console.log("[NDK-WALLET] Stored last updated at for wallet", wallet.walletId, "as", now);
    }, [ settingsStore ]);

    const setActiveWallet = useCallback((wallet: NDKWallet) => {
        if (!ndk) return;
        let debounceTimer: NodeJS.Timeout | undefined;

        storeSetActiveWallet(wallet);
        ndk.wallet = wallet;

        let loadingString: string | undefined;

        const updateBalance = () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const b = wallet ? wallet.balance() : null;
                setBalance(b);
            }, 50);
        }

        if (wallet) {
            wallet.on('ready', () => storeLastUpdatedAt(wallet));
            wallet.on('ready', updateBalance);
            wallet.on('balance_updated', updateBalance);
        } else {
            setBalance(null);
        }

        if (wallet instanceof NDKCashuWallet) {
            const lastUpdatedAt = settingsStore?.getSync('wallet_' + wallet.walletId + '_last_updated_at');
            console.log("[NDK-WALLET] Starting wallet", wallet.walletId, "with since", lastUpdatedAt);
            wallet.start({ subId: 'wallet', since: lastUpdatedAt ? parseInt(lastUpdatedAt) : undefined });
        }

        if (wallet) wallet.updateBalance?.();

        if (wallet) loadingString = wallet.toLoadingString?.();
        if (loadingString) 
            settingsStore.set('wallet', loadingString);
        else
            settingsStore.delete('wallet');
    }, [ ndk, settingsStore, activeWallet, setBalance ]);

    return { activeWallet, setActiveWallet, balance, setBalance };
}

export {
    useNDKNutzapMonitor,
    useNDKWallet,
}