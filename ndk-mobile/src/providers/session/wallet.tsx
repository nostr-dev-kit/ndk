// import React from "react";
// import { useSessionStore } from "../../stores/session";
// import NDK from "@nostr-dev-kit/ndk";
// import { NDKWallet, NDKCashuWallet, NDKNWCWallet, NDKNutzapMonitor } from "@nostr-dev-kit/ndk-wallet";
// import { useWalletStore } from "../../stores/wallet";
// import { SettingsStore } from ".";
// import { PropsWithChildren, useRef, useEffect, useCallback } from "react";
// import { NDKEvent, NDKKind, NDKSubscription, NostrEvent, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
// import { useNDK } from "../../hooks/ndk";
// import NDKWalletContext from "../../context/wallet";
// import { useNDKSession } from "../../hooks/session";

// interface NDKSessionWalletProps {
// }

// export default function NDKSessionWallet({ children, ...opts }: PropsWithChildren<NDKSessionWalletProps>) {
//     const { ndk, currentUser } = useNDK();
//     const walletStore = useWalletStore();
//     const balances = useWalletStore((state) => state.balances);
//     const setBalances = useWalletStore((state) => state.setBalances);
//     const setNutzapMonitor = useWalletStore((state) => state.setNutzapMonitor);
//     const subRef = useRef<NDKSubscription | undefined>(undefined);
//     const { addEvent } = useSessionStore();
//     const { settingsStore } = useNDKSession();

//     const processCashuWalletEvent = (event: NDKEvent) => {
//         addEvent(NDKKind.CashuWallet, event);
//     };

//     /**
//      * Set the active wallet
//      * @param wallet - The wallet to set
//      * @param save - Whether to store this setting locally
//      */
//     const setActiveWallet = useCallback((
//         wallet: NDKWallet,
//         save = true
//     ) => {
//         if (!ndk) return;
//             ndk.wallet = wallet;

//         const updateBalance = () => {
//             if (!wallet) return;
//             console.log('Updating balance from balance_updated event')
//             setBalances(wallet.balance());
//         }

//         if (wallet) {
//             wallet.on("ready", () => {
//                 console.log('Updating balance from ready event')
//                 setBalances(wallet.balance());
//             });

//             wallet.on('balance_updated', () => {
//                 updateBalance();
//             });

//             if (wallet instanceof NDKCashuWallet) {
//                 wallet.start({
//                     cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
//                 });
//                 const monitor = new NDKNutzapMonitor(ndk, currentUser);
//                 monitor.addWallet(wallet);
//                 monitor.on('seen', (zap) => {
//                     console.log('zap seen', zap.rawEvent());
//                 });
//                 monitor.on('redeem', (zap) => {
//                     console.log('zap redeemed', zap.rawEvent());
//                 });
//                 setNutzapMonitor(monitor);
                
//                 monitor.start();
//             }
//         }
        
//         walletStore.setActiveWallet(wallet);
//         if (wallet) updateBalance();
//         else {
//             setBalances([]);
//         }

//         if (save && settingsStore) {
//             persistWalletConfiguration(wallet, settingsStore);
//         }
//     }, [ndk, currentUser]);

//     useEffect(() => {
//         if (!ndk || !currentUser) return;
//         if (subRef.current) {
//             subRef.current.stop();
//         }

//         subRef.current = ndk.subscribe([
//             { kinds: [NDKKind.CashuWallet], authors: [currentUser.pubkey] }
//         ], { closeOnEose: false }, undefined, false);
//         subRef.current.on('event', processCashuWalletEvent);
//         subRef.current.start();

//         if (settingsStore && !ndk.wallet) {
//             loadWallet(ndk, settingsStore, (wallet) => setActiveWallet(wallet, false));
//         }
//     }, [ndk, currentUser]);

//     return (
//         <NDKWalletContext.Provider
//             value={{
//                 setActiveWallet,
//                 ...walletStore,
//                 balances,
//                 setNutzapMonitor
//             }}>
//             {children}
//         </NDKWalletContext.Provider>
//     )
// }


// function walletPayload(wallet: NDKWallet) {
//     if (wallet instanceof NDKNWCWallet) {
//         return wallet.pairingCode;
//     } else if (wallet instanceof NDKCashuWallet) {
//         return wallet.event.rawEvent();
//     }
// }



// async function loadWallet(ndk: NDK, settingsStore: SettingsStore, setActiveWallet: (wallet: NDKWallet | null) => void) {
//     const walletConfig = await settingsStore.get('wallet');
//     if (!walletConfig) return;

//     const loadNWCWallet = (pairingCode: string) => {
//         const wallet = new NDKNWCWallet(ndk);
//         wallet.initWithPairingCode(pairingCode).then(() => {
//             setActiveWallet(wallet);
//         });
//     }

//     const loadNIP60Wallet = async (payload: NostrEvent) => {
//         try {
//             // Load the cached event
//             const event = new NDKEvent(ndk, payload);
//             const wallet = await NDKCashuWallet.from(event);
//             setActiveWallet(wallet);

//             const relaySet = wallet.relaySet;

//             // Load remotely
//             const freshEvent = await ndk.fetchEvent(event.encode(), { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY }, relaySet);
//             if (!freshEvent) {
//                 console.log("Refreshing the event came back empty, has the wallet been deleted?")
//                 setActiveWallet(null);
//                 return null;
//             }

//             if (freshEvent.hasTag('deleted')) {
//                 alert('This wallet has been deleted');
//                 setActiveWallet(null);
//                 return null;
//             } else if (freshEvent.created_at! > event.created_at!) {
//                 const wallet = await NDKCashuWallet.from(freshEvent);
//                 alert('This wallet has been updated');
//                 setActiveWallet(wallet);

//                 // update the cache
//                 persistWalletConfiguration(wallet, settingsStore);

//                 return wallet;
//             }

//             return wallet;
//         } catch (e) {
//             console.error('Error activating wallet', e);
//             console.log(payload)
//         }
//     }

//     try {
//         const { type, payload } = JSON.parse(walletConfig);
//         if (type === 'nwc') {
//             loadNWCWallet(payload);
//         } else if (type === 'nip-60') {
//             loadNIP60Wallet(payload);
//         } else {
//             alert('Unknown wallet type: ' + type);
//         }
//     } catch (e) {
//         alert('Failed to load wallet configuration');
//         settingsStore.delete('wallet');
//     }
// }


// /**
//  * Persist the wallet configuration
//  * @param wallet - The wallet to persist
//  * @param settingsStore - The settings store to use
//  */
// function persistWalletConfiguration(wallet: NDKWallet, settingsStore: SettingsStore) {
//     if (!wallet) {
//         settingsStore.delete('wallet');
//         return;
//     }
    
//     const payload = walletPayload(wallet);
//     if (!payload) {
//         alert('Failed to persist wallet configuration!');
//         return;
//     }

//     const type = wallet.type;
//     settingsStore.set('wallet', JSON.stringify({ type, payload }));
// }