import { NDKCashuWallet, NDKNutzapMonitor, NDKNWCWallet, NDKWallet } from '@nostr-dev-kit/ndk-wallet';
import { NDKCashuMintList } from '@nostr-dev-kit/ndk';
import { useWalletStore } from '../stores/wallet.js';
import { useNDK, useNDKCurrentUser } from './ndk.js';
import { useNDKStore } from '../stores/ndk.js';
import { useEffect, useCallback } from 'react';
import { getNutzaps, saveNutzap } from '../db/wallet/nutzaps.js';
import { wallet } from '../db/index.js';
import NDK from '@nostr-dev-kit/ndk';

const getKnownNutzaps = (ndk: NDK) => {
    const nutzaps = getNutzaps(ndk);
    
    return new Set(nutzaps
        .filter(n => n.status === 'redeemed' || n.status === 'spent' || n.status === 'failed')
        .map(n => n.event_id)
    );
}

/**
 * @param start - Whether to start the nutzap monitor if it hasn't been started yet.
 * @returns 
 */
const useNDKNutzapMonitor = (mintList?: NDKCashuMintList, start: boolean = false) => {
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
        if (nutzapMonitor) {
            nutzapMonitor.wallet = activeWallet;
            nutzapMonitor.mintList = mintList;
            return;
        }

        const isCashu = (activeWallet instanceof NDKCashuWallet);
        const isNwc = (activeWallet instanceof NDKNWCWallet);

        if (!(isCashu || isNwc)) return;

        // Create a store from our SQLite implementation
        const store = wallet.nutzapMonitor.createNutzapMonitorStore(ndk);
        
        // Use the new constructor signature with object parameters
        const monitor = new NDKNutzapMonitor(
            ndk, 
            currentUser, 
            { 
                mintList, 
                store 
            }
        );

        setNutzapMonitor(monitor);
        
        monitor.wallet = activeWallet;

        monitor.on("seen", (event) => {
            saveNutzap(ndk, [event]);
        });

        monitor.on("redeemed", (events, amount) => {
            saveNutzap(ndk, events, "redeemed", Math.floor(Date.now()/1000));
        });

        monitor.on("state_changed", (eventId, status) => {
            if (status === 'spent') {
                // We need to find the nutzap first
                monitor.nutzapStates.forEach((state, id) => {
                    if (id === eventId && state.nutzap) {
                        saveNutzap(ndk, [state.nutzap], "spent");
                    }
                });
            }
        });

        monitor.start({
            filter: { limit: 100 },
            opts: { skipVerification: true }
        });
    }, [ nutzapMonitor, setNutzapMonitor, activeWallet?.walletId, currentUser?.pubkey, ndk, start, mintList ])
    
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
        settingsStore.set('wallet_last_updated_at', now.toString());
    }, [ settingsStore ]);

    const setActiveWallet = useCallback((wallet: NDKWallet) => {
        if (!ndk) return;
        let debounceTimer: NodeJS.Timeout | undefined;

        storeSetActiveWallet(wallet);
        ndk.wallet = wallet;

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
            settingsStore.delete('wallet_last_updated_at');
            
            setBalance(null);
        }

        if (wallet) wallet.updateBalance?.();
    }, [ ndk, settingsStore, activeWallet, setBalance ]);

    return { activeWallet, setActiveWallet, balance, setBalance };
}

export {
    useNDKNutzapMonitor,
    useNDKWallet,
}