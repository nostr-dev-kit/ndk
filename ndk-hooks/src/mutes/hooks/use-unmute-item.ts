import { useCallback } from "react";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKCurrentPubkey } from "../../ndk/hooks";
import { useNDKMutes } from "../store";
import type { MuteItemType, PublishMuteListOptions } from "../store/types";
import type { MutableItem } from "./use-mute-item";

/**
 * React hook to get a function that unmutes an item for the current user.
 * @param options Options for publishing the mute list
 * @returns A function that unmutes an item
 */
export function useUnmuteItem(options?: PublishMuteListOptions): (item: MutableItem) => void {
    const currentPubkey = useNDKCurrentPubkey();
    const unmuteItem = useNDKMutes((s) => s.unmuteItem);

    return useCallback(
        (item: MutableItem) => {
            if (!currentPubkey) {
                console.warn("useUnmuteItem: No active user found. Cannot unmute item.");
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
                console.warn("useUnmuteItem: Invalid item type provided.", item);
                return;
            }

            unmuteItem(currentPubkey, value, itemType, options);
        },
        [currentPubkey, unmuteItem, options],
    );
}
