import '@bacons/text-decoder/install';
import 'react-native-get-random-values';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { NDKCashuWallet, NDKWallet } from '@nostr-dev-kit/ndk-wallet';
import { useNDK } from '../../hooks/ndk';
import { NDKCashuMintList, NDKKind } from '@nostr-dev-kit/ndk';
import { useSubscribe } from '../../hooks';

interface NDKWalletContextType {
    wallets: NDKWallet[];
    defaultWallet: NDKWallet | null;
    mintList: NDKCashuMintList | null;
}

const NDKWalletContext = createContext<NDKWalletContextType>({
    wallets: [],
    defaultWallet: null,
    mintList: null,
});

export const useNDKWallet = () => useContext(NDKWalletContext);

export const NDKWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [defaultWallet, setDefaultWallet] = useState<NDKWallet | null>(null);
    const { ndk, currentUser } = useNDK();
    const walletsFilter = useMemo(() => {
        if (!currentUser) return;
        return [{ kinds: [NDKKind.CashuMintList, NDKKind.CashuWallet], authors: [currentUser?.pubkey] }];
    }, [currentUser]);
    const opts = useMemo(() => ({ groupable: false }), []);
    const { events: walletEvents } = useSubscribe({ filters: walletsFilter, opts });
    const [wallets, setWallets] = useState<NDKWallet[]>([]);
    const mintList = useMemo(() => {
        const e = walletEvents
            .find((event) => event.kind === NDKKind.CashuMintList);
        if (e) return NDKCashuMintList.from(e);
        return null;
    }, [walletEvents, ndk]);

    useEffect(() => {
        const walletPromises = walletEvents
            .filter((event) => event.kind === NDKKind.CashuWallet)
            .map(event => NDKCashuWallet.from(event));
        
        Promise.all(walletPromises).then(wallets => {
            if (mintList?.p2pk) {
                for (const wallet of wallets) {
                    if (wallet.p2pk === mintList.p2pk) {
                        setDefaultWallet(wallet);
                        break;
                    }
                }
            }
            
            setWallets(wallets);
        });
    }, [walletEvents, ndk, mintList]);

    return <NDKWalletContext.Provider value={{ wallets, defaultWallet, mintList }}>{children}</NDKWalletContext.Provider>;
};
