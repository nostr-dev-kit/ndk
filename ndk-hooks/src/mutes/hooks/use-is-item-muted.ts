import { useMemo } from "react";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useActiveMuteCriteria } from "./use-mute-criteria";
import type { MutableItem, MuteItemType } from "../store/types";

/**
 * React hook to check if an item is muted for the current user.
 * @param item The item to check
 * @returns True if the item is muted, false otherwise
 */
export function useIsItemMuted(item: MutableItem): boolean {
    const muteCriteria = useActiveMuteCriteria();

    return useMemo(() => {
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

        switch (itemType) {
            case "event":
                return muteCriteria.eventIds.has(value);
            case "pubkey":
                return muteCriteria.pubkeys.has(value);
            case "hashtag":
                return muteCriteria.hashtags.has(value);
            case "word":
                return muteCriteria.words.has(value);
            default:
                return false;
        }
    }, [muteCriteria, item]);
}
