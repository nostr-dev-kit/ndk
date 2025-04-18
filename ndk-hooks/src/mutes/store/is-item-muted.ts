import type { NDKMutesState, MuteItemType } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Checks if an item (pubkey, event, hashtag, or word) is muted for a user.
 * @param get Zustand get function
 * @param pubkey The user's public key
 * @param item The item to check
 * @param type The type of the item
 */
export const isItemMuted = (get: () => NDKMutesState, pubkey: Hexpubkey, item: string, type: MuteItemType): boolean => {
    const userMutes = get().mutes.get(pubkey);
    console.log("Checking if item is muted for pubkey:", pubkey, "item:", item, "type:", type);
    if (!userMutes) return false;

    switch (type) {
        case "pubkey":
            return userMutes.pubkeys.has(item);
        case "event":
            return userMutes.eventIds.has(item);
        case "hashtag":
            return userMutes.hashtags.has(item.toLowerCase());
        case "word": {
            if (userMutes.words.size === 0) return false;
            const lowerItem = item.toLowerCase();
            for (const word of userMutes.words) {
                if (lowerItem.includes(word.toLowerCase())) {
                    return true;
                }
            }
            return false;
        }
        default:
            return false;
    }
};