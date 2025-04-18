import { useCallback, useMemo } from "react";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKMutes } from "../store";
import { useNDKCurrentPubkey } from "../../ndk/hooks";
import type { MuteItemType, PublishMuteListOptions } from "../store/types";

/**
 * Type definition for the item that can be muted.
 */
type MutableItem = NDKEvent | NDKUser | string;

export function useMuteFilter(): (event: NDKEvent) => boolean {
    const filterFn = useCallback(
        (event: NDKEvent): boolean => {
            return false;
        },
        [],
    );

    return filterFn;
}

/**
 * Hook to get a function that mutes an item
 * @param options Options for publishing the mute list
 * @returns A function that mutes an item
 */
export function useMuteItem(options?: PublishMuteListOptions): (item: MutableItem) => void {
    const currentPubkey = useNDKCurrentPubkey();
    const muteItem = useNDKMutes((s) => s.muteItem);

    const muteFn = useCallback(
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

    return muteFn;
}

/**
 * Hook to get a function that unmutes an item
 * @param options Options for publishing the mute list
 * @returns A function that unmutes an item
 */
export function useUnmuteItem(options?: PublishMuteListOptions): (item: MutableItem) => void {
    const currentPubkey = useNDKCurrentPubkey();
    const unmuteItem = useNDKMutes((s) => s.unmuteItem);

    const unmuteFn = useCallback(
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

    return unmuteFn;
}

/**
 * Hook to check if an item is muted
 * @param item The item to check
 * @returns True if the item is muted
 */
export function useIsItemMuted(item: MutableItem): boolean {
    const currentPubkey = useNDKCurrentPubkey();
    const isItemMuted = useNDKMutes((s) => s.isItemMuted);

    // Determine the item type and value outside of useMemo
    let itemType: MuteItemType | undefined;
    let itemValue: string | undefined;

    if (item instanceof NDKEvent) {
        itemType = "event";
        itemValue = item.id;
    } else if (item instanceof NDKUser) {
        itemType = "pubkey";
        itemValue = item.pubkey;
    } else if (typeof item === "string") {
        if (item.startsWith("#") && item.length > 1) {
            itemType = "hashtag";
            itemValue = item.substring(1);
        } else {
            itemType = "word";
            itemValue = item;
        }
    }

    return useMemo(() => {
        if (!currentPubkey || !itemType || !itemValue) return false;
        return isItemMuted(currentPubkey, itemValue, itemType);
    }, [currentPubkey, isItemMuted, itemType, itemValue]);
}

/**
 * Hook to publish the mute list for the active user
 * @returns A function that publishes the mute list
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

// Export all hooks from individual files
export * from "./use-mute-criteria";
