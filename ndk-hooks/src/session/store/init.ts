// src/session/store/init.ts
import type NDK from '@nostr-dev-kit/ndk';
import type { Draft } from 'immer';
import type { NDKSessionsState } from './types';

// set is now Immer-patched: set((draft) => { mutation })
export const init = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    ndk: NDK
): void => {
    set((draft) => {
        draft.ndk = ndk;
    });
};