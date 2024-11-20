import { Hexpubkey, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { createContext } from 'react';

interface NDKSessionContext {
    follows?: Array<Hexpubkey>;
    events?: Map<NDKKind, Array<NDKEvent>>;
}

const NDKSessionContext = createContext<NDKSessionContext>({
    follows: [],
    events: new Map(),
});

export default NDKSessionContext;
