import { useEffect, useState } from "react";
import { useNDKSessions } from "../../session/store";
import { useNDKMutes } from "../store";
import type { MuteCriteria, NDKMutesState } from "../store/types";
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

    console.log("useActiveMuteCriteria", activePubkey);

    // Get the raw criteria from the store
    return useMuteCriteria(activePubkey);
}

export function useMuteCriteria(pubkey?: string): MuteCriteria {
    const mutesForPubkey = useNDKMutes((s: NDKMutesState) => pubkey ? s.mutes.get(pubkey) : EMPTY_MUTE_CRITERIA);
    const extraMutes = useNDKMutes((s: NDKMutesState) => s.extraMutes);
    const [criteria, setCriteria] = useState<MuteCriteria>(EMPTY_MUTE_CRITERIA);

    console.log('calling into useMuteCriteria', pubkey);

    useEffect(() => {
        // combine the mutes from the store and the extra mutes
        const combinedMutes = {
            eventIds: new Set<string>([...(mutesForPubkey?.eventIds || []), ...(extraMutes?.eventIds || [])]),
            hashtags: new Set<string>([...(mutesForPubkey?.hashtags || []), ...(extraMutes?.hashtags || [])]),
            words: new Set<string>([...(mutesForPubkey?.words || []), ...(extraMutes?.words || [])]),
            pubkeys: new Set<string>([...(mutesForPubkey?.pubkeys || []), ...(extraMutes?.pubkeys || [])]),
        };

        console.log('Combined mutes for pubkey:', pubkey, '->', combinedMutes);

        // set the criteria state to the combined mutes
        setCriteria(combinedMutes);
    }, [pubkey,
        mutesForPubkey?.eventIds, mutesForPubkey?.hashtags, mutesForPubkey?.words, mutesForPubkey?.pubkeys,
        extraMutes?.eventIds, extraMutes?.hashtags, extraMutes?.words, extraMutes?.pubkeys
    ]);

    return criteria;
}