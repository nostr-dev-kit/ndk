import { useMemo } from "react";
import { useNDKSessions } from "../../session/store";
import { useNDKMutes } from "../store";
import type { MuteCriteria } from "../store/types";
import { EMPTY_MUTE_CRITERIA } from "./use-mute-filter";

/**
 * React hook to get the mute criteria for the active user.
 * The mute store is automatically synchronized with the session store
 * through the session store functions.
 *
 * This hook uses memoization to prevent unnecessary re-renders when the criteria
 * object hasn't actually changed. This is crucial for preventing infinite loops
 * in useEffect, useMemo, and useCallback hooks that depend on the criteria.
 *
 * @returns The mute criteria for the active user, or empty criteria if no user is active.
 */
export function useActiveMuteCriteria(): MuteCriteria {
    const activePubkey = useNDKSessions((s) => s.activePubkey);

    // Get the raw criteria from the store
    return useNDKMutes((s) => (activePubkey ? s.getMuteCriteria(activePubkey) : EMPTY_MUTE_CRITERIA));
}
