import { useCallback } from "react";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKCurrentPubkey } from "../../ndk/hooks";
import { useNDKMutes } from "../store";
import type { MuteItemType, PublishMuteListOptions } from "../store/types";

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

            let itemType: MuteItemType;
            let value: string;

            if (item instanceof NDKEvent) {
                itemType = "event";
                value = item.id;
            } else if (item instanceof NDKUser) {
                itemType = "pubkey";
                value = item.pubkey;
            } else if (typeof item === "string") {
                if (item.startsWith("#") && item.length > 1) {
                    itemType = "hashtag";
                    value = item.substring(1);
                } else {
                    itemType = "word";
                    value = item;
                }
            } else {
                console.warn("useMuteItem: Invalid item type provided.", item);
                return;
            }

            muteItem(currentPubkey, value, itemType, options);
        },
        [currentPubkey, muteItem, options],
    );
}
