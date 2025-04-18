import { useCallback } from "react";
import { useNDKCurrentPubkey } from "../../ndk/hooks";
import { useNDKMutes } from "../store";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

/**
 * React hook to get a function that publishes the mute list for the current user.
 * @returns A function that publishes the mute list and returns the event or undefined
 */
export function usePublishMuteList(): () => Promise<NDKEvent | undefined> {
    const currentPubkey = useNDKCurrentPubkey();
    const publishMuteList = useNDKMutes((s) => s.publishMuteList);

    return useCallback(async () => {
        if (!currentPubkey) {
            console.warn("usePublishMuteList: No active user found. Cannot publish mute list.");
            return undefined;
        }

        return publishMuteList(currentPubkey);
    }, [currentPubkey, publishMuteList]);
}
