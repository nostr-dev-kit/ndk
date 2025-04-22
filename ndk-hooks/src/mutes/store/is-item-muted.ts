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
    const extraMutes = get().extraMutes;
    
    if (!userMutes && !extraMutes) return false;

    switch (type) {
        case "pubkey":
            return (userMutes && userMutes.pubkeys.has(item)) ||
                   extraMutes.pubkeys.has(item);
        case "event":
            return (userMutes && userMutes.eventIds.has(item)) ||
                   extraMutes.eventIds.has(item);
        case "hashtag": {
            const lowerItem = item.toLowerCase();
            return (userMutes && userMutes.hashtags.has(lowerItem)) ||
                   extraMutes.hashtags.has(lowerItem);
        }
        case "word": {
            const lowerItem = item.toLowerCase();
            
            // Check regular mutes
            if (userMutes && userMutes.words.size > 0) {
                for (const word of userMutes.words) {
                    if (lowerItem.includes(word.toLowerCase())) {
                        return true;
                    }
                }
            }
            
            // Check extra mutes
            if (extraMutes.words.size > 0) {
                for (const word of extraMutes.words) {
                    if (lowerItem.includes(word.toLowerCase())) {
                        return true;
                    }
                }
            }
            
            return false;
        }
        default:
            return false;
    }
};
