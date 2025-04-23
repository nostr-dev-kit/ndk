import { useCallback } from "react";
import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKCurrentPubkey } from "../../ndk/hooks";
import { useNDKMutes } from "../store";
import type { PublishMuteListOptions } from "../store/types";
import { identifyMuteItem } from "../utils/identify-mute-item";

/**
 * Type for items that can be muted.
 */
export type MutableItem = NDKEvent | NDKUser | string;

/**
 * React hook to get a function that mutes an item for the current user.
 * @param options Options for publishing the mute list
 * @returns A function that mutes an item
 */
export function useMuteItem(options?: PublishMuteListOptions): (item: MutableItem) => void {
    const currentPubkey = useNDKCurrentPubkey();
    const muteItem = useNDKMutes((s) => s.muteItem);

    return useCallback(
        (item: MutableItem) => {
            if (!currentPubkey) {
                console.warn("useMuteItem: No active user found. Cannot mute item.");
                return;
            }

            const identified = identifyMuteItem(item);
            if (!identified) return;

            const { type, value } = identified;
            muteItem(currentPubkey, value, type, options);
        },
        [currentPubkey, muteItem, options],
    );
}
