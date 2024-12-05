import { Hexpubkey, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { NDKCashuWallet, NDKWallet, NDKWalletBalance } from '@nostr-dev-kit/ndk-wallet';
import { createContext } from 'react';

interface NDKSessionContext {
    follows?: Array<Hexpubkey>;
    events?: Map<NDKKind, Array<NDKEvent>>;
    mutePubkey: (pubkey: Hexpubkey) => void;
    muteList: Set<Hexpubkey>;

    activeWallet?: NDKWallet;
    setActiveWallet: (wallet: NDKWallet) => void;

    balances: NDKWalletBalance[];
}

const NDKSessionContext = createContext<NDKSessionContext>({
    follows: [],
    events: new Map(),
    mutePubkey: () => {},
    muteList: new Set(),
    activeWallet: undefined,
    setActiveWallet: () => {},
    balances: [],
});

export default NDKSessionContext;
