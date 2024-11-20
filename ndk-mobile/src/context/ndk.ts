import NDK, { NDKFilter, NDKEvent, NDKUser, NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner, NDKSigner } from '@nostr-dev-kit/ndk';
import { createContext } from 'react';
import { StoreApi } from 'zustand';
import { UnpublishedEventEntry } from '../providers/ndk';

interface NDKContext {
    ndk: NDK | undefined;

    login: (promise: Promise<NDKSigner | null>) => Promise<void>;
    loginWithPayload: (payload: string, { save }: { save?: boolean }) => Promise<void>;
    logout: () => Promise<void>;
    unpublishedEvents: Map<string, UnpublishedEventEntry>;

    currentUser: NDKUser | null;

    cacheInitialized: boolean | null;
}

const NDKContext = createContext<NDKContext>({
    ndk: undefined,
    login: () => Promise.resolve(undefined),
    loginWithPayload: () => Promise.resolve(undefined),
    logout: () => Promise.resolve(undefined),

    currentUser: null,
    unpublishedEvents: new Map(),

    cacheInitialized: null,
});

export default NDKContext;
