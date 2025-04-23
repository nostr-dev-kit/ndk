import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import type { MuteItemType } from "../store/types";
import type { MutableItem } from "../hooks/use-mute-item";

/**
 * Identifies the type and value of a mutable item
 * @param item The item to identify
 * @returns An object with the type and value of the item, or undefined if the item is invalid
 */
export function identifyMuteItem(item: MutableItem): { type: MuteItemType; value: string } | undefined {
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
        console.warn("identifyMuteItem: Invalid item type provided.", item);
        return undefined;
    }

    return { type: itemType, value };
}
