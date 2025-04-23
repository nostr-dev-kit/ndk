import { useCallback, useMemo } from "react";
import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import { isMuted } from "../../utils/mute";
import type { MuteCriteria } from "../store/types";
import { useActiveMuteCriteria } from "./use-mute-criteria";

export const EMPTY_MUTE_CRITERIA: MuteCriteria = {
    pubkeys: new Set(),
    eventIds: new Set(),
    hashtags: new Set(),
    words: new Set(),
};

/**
 * Hook that returns a fresh, stable `isMuted()` function that always reflects current mute state.
 *
 * This implementation avoids infinite loops by:
 * 1. Using a single selector to get all mute data at once
 * 2. Creating a stable reference to the filter function with useMemo
 * 3. Using a stable dependency (the serialized state) for the memoization
 */
export function useMuteFilter(): (event: NDKEvent) => boolean {
    const muteCriteria = useActiveMuteCriteria();

    return useCallback(
        (event: NDKEvent) => {
            return isMuted(event, muteCriteria);
        },
        [muteCriteria],
    );
}
