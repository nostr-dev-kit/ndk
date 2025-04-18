import { useMemo } from "react";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKCurrentPubkey } from "../../ndk/hooks";
import { useNDKMutes } from "../store";
import type { MuteItemType } from "../store/types";
import type { MutableItem } from "./use-mute-item";

/**
 * React hook to check if an item is muted for the current user.
 * @param item The item to check
 * @returns True if the item is muted, false otherwise
 */
export function useIsItemMuted(item: MutableItem): boolean {
    const currentPubkey = useNDKCurrentPubkey();
    const isItemMuted = useNDKMutes((s) => s.isItemMuted);

    return useMemo(() => {
        if (!currentPubkey) return false;

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
            return false;
        }

        return isItemMuted(currentPubkey, value, itemType);
    }, [currentPubkey, isItemMuted, item]);
}
