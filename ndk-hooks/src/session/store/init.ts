import type NDK from "@nostr-dev-kit/ndk";
import type { NDKSessionsState } from "./types";

export const init = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    ndk: NDK,
): void => {
    set({ ndk });
};
