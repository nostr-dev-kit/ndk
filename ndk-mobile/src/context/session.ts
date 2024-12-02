import { Hexpubkey, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { createContext } from 'react';

interface NDKSessionContext {
    follows?: Array<Hexpubkey>;
    events?: Map<NDKKind, Array<NDKEvent>>;
    mutePubkey: (pubkey: Hexpubkey) => void;
    muteList: Set<Hexpubkey>;
}

const NDKSessionContext = createContext<NDKSessionContext>({
    follows: [],
    events: new Map(),
    mutePubkey: () => {},
    muteList: new Set(),
});

export default NDKSessionContext;
