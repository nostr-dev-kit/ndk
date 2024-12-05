import React from 'react';
import NDKSessionContext from '../../context/session';
import { NDKEventWithFrom } from '../../hooks';
import { useNDK } from '../../hooks/ndk';
import { NDKEvent, NDKEventId, NDKFilter, NDKKind, NDKRelay, NDKSubscription, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import { PropsWithChildren, useEffect } from 'react';
import { useSessionStore } from '../../stores/session';
import { NDKCashuWallet, NDKNutzapMonitor, NDKNWCWallet, NDKWallet, NDKWalletTypes } from '@nostr-dev-kit/ndk-wallet';
import { useWalletStore } from '../../stores/wallet';

interface NDKSessionProviderProps {
    follows?: boolean;
    muteList?: boolean;
    wallet?: boolean
    walletConfig?: { type: NDKWalletTypes, pairingCode: string };
    kinds?: Map<NDKKind, { wrapper?: NDKEventWithFrom<any> }>;
}

const NDKSessionProvider = ({ children, ...opts }: PropsWithChildren<NDKSessionProviderProps>) => {
    const { ndk, currentUser } = useNDK();
    const { setFollows, setMuteList, addEvent } = useSessionStore();
    const walletStore = useWalletStore();
    let sub: NDKSubscription | undefined;
    let knownEventIds = new Set<NDKEventId>();
    let followEvent: NDKEvent | undefined;
    const balances = useWalletStore((state) => state.balances);
    const setBalances = useWalletStore((state) => state.setBalances);

    const processFollowEvent = (event: NDKEvent, relay: NDKRelay) => {
        if (followEvent && followEvent.created_at! > event.created_at!) return;

        const pubkeys = new Set(event.tags.filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]));
        setFollows(Array.from(pubkeys));
        followEvent = event;
    };

    const processMuteListEvent = (event: NDKEvent, relay: NDKRelay) => {
        setMuteList(event);
    };

    const processCashuWalletEvent = (event: NDKEvent) => {
        addEvent(NDKKind.CashuWallet, event);
    };

    const handleEvent = (event: NDKEvent, relay: NDKRelay) => {
        if (knownEventIds.has(event.id)) return;
        knownEventIds.add(event.id);
        const kind = event.kind!;

        switch (kind) {
            case 3:
                return processFollowEvent(event, relay);
            case NDKKind.MuteList:
                return processMuteListEvent(event, relay);
            case NDKKind.CashuWallet:
                return processCashuWalletEvent(event);
            default:
                const entry = opts.kinds!.get(kind);
                if (entry?.wrapper) {
                    event = entry.wrapper.from(event);
                }
                addEvent(kind, event);
        }
    };

    const setActiveWallet = (wallet: NDKWallet) => {
        ndk.wallet = wallet;
        if (wallet instanceof NDKCashuWallet) {
            setBalances(wallet.balance());
        }

        const updateBalance = () => {
            if (!wallet) return;
            setBalances(wallet.balance());
        }

        wallet?.on("ready", () => {
            setBalances(wallet.balance());
        });

        if (wallet) {
            wallet.on('balance_updated', () => {
                updateBalance();
            });

            if (wallet instanceof NDKCashuWallet) {
                wallet.start({
                    cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
                });
                const monitor = new NDKNutzapMonitor(ndk, currentUser);
                monitor.addWallet(wallet);
                monitor.on('seen', (zap) => {
                    console.log('zap seen', zap.rawEvent());
                });
                monitor.on('redeem', (zap) => {
                    console.log('zap redeemed', zap.rawEvent());
                });
                monitor.start();
            }
        }
        
        walletStore.setActiveWallet(wallet);
        if (wallet) updateBalance();
        else {
            setBalances([]);
        }
    }

    useEffect(() => {
        if (!ndk || !currentUser) return;
        if (sub) {
            sub.stop();
        }

        let filters: NDKFilter[] = [];

        filters.push({ kinds: [], authors: [currentUser.pubkey] });

        if (opts.follows) filters[0].kinds!.push(3);
        if (opts.muteList) filters[0].kinds!.push(NDKKind.MuteList);
        if (opts.wallet) filters[0].kinds!.push(NDKKind.CashuWallet);
        if (opts.kinds) filters[0].kinds!.push(...opts.kinds.keys());

        if (opts.walletConfig) {
            if (opts.walletConfig.type === 'nwc') {
                const wallet = new NDKNWCWallet(ndk);
                wallet.initWithPairingCode(opts.walletConfig.pairingCode).then(() => {
                    setActiveWallet(wallet);
                });
            }
        }

        if (filters[0].kinds!.length > 0) {
            sub = ndk.subscribe(filters, { closeOnEose: false }, undefined, false);
            sub.on('event', handleEvent);
            sub.start();
        }
    }, [ndk, opts.follows, opts.muteList, opts.walletConfig, currentUser]);

    return (
        <NDKSessionContext.Provider
            value={{
                follows: useSessionStore((state) => state.follows),
                events: useSessionStore((state) => state.events),
                muteList: useSessionStore((state) => state.muteList),
                mutePubkey: useSessionStore((state) => state.mutePubkey),
                ...walletStore,
                balances,
                setActiveWallet
            }}>
            {children}
        </NDKSessionContext.Provider>
    );
};

export { NDKSessionProvider };
