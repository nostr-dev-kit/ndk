import type { NDK } from "../../ndk/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";
import { NDKList } from "./lists/index.js";

/**
 * Represents a NIP-51 kind 10012 Relay Feed List.
 *
 * This list contains user's favorite browsable relays and relay sets.
 * Items can be:
 * - `relay` tags pointing to relay URLs
 * - `a` tags pointing to kind:30002 relay sets
 *
 * @example
 * const relayFeedList = new NDKRelayFeedList(ndk);
 * relayFeedList.addRelay("wss://relay.damus.io");
 * relayFeedList.addRelaySet("30002:pubkey:dtagvalue");
 * await relayFeedList.publish();
 *
 * @group Kind Wrapper
 */
export class NDKRelayFeedList extends NDKList {
    static kind = NDKKind.RelayFeedList;
    static kinds = [NDKKind.RelayFeedList];

    constructor(ndk?: NDK, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        if (!rawEvent?.kind) {
            this.kind = NDKKind.RelayFeedList;
        }
    }

    static from(ndkEvent: NDKEvent): NDKRelayFeedList {
        return new NDKRelayFeedList(ndkEvent.ndk, ndkEvent);
    }

    /**
     * Gets all relay URLs from the list.
     */
    get relayUrls(): string[] {
        return this.getMatchingTags("relay").map(tag => tag[1]);
    }

    /**
     * Gets all relay set references (kind:30002 naddr) from the list.
     * Returns them in the format "kind:pubkey:dtag".
     */
    get relaySets(): string[] {
        return this.getMatchingTags("a").map(tag => tag[1]);
    }

    /**
     * Adds a relay URL to the list.
     * @param relayUrl - WebSocket URL of the relay
     * @param mark - Optional mark to add to the relay tag
     * @param encrypted - Whether to encrypt the item
     * @param position - Where to add the item in the list
     */
    async addRelay(
        relayUrl: string,
        mark?: string,
        encrypted = false,
        position: "top" | "bottom" = "bottom"
    ): Promise<void> {
        const tag: string[] = ["relay", relayUrl];
        if (mark) tag.push(mark);
        await this.addItem(tag, undefined, encrypted, position);
    }

    /**
     * Adds a relay set reference to the list.
     * @param relaySetNaddr - NIP-33 address in format "kind:pubkey:dtag" (kind should be 30002)
     * @param mark - Optional mark to add to the relay set tag
     * @param encrypted - Whether to encrypt the item
     * @param position - Where to add the item in the list
     */
    async addRelaySet(
        relaySetNaddr: string,
        mark?: string,
        encrypted = false,
        position: "top" | "bottom" = "bottom"
    ): Promise<void> {
        const tag: string[] = ["a", relaySetNaddr];
        if (mark) tag.push(mark);
        await this.addItem(tag, undefined, encrypted, position);
    }

    /**
     * Removes a relay URL from the list.
     * @param relayUrl - The relay URL to remove
     * @param publish - Whether to publish the change
     */
    async removeRelay(relayUrl: string, publish = true): Promise<void> {
        await this.removeItemByValue(relayUrl, publish);
    }

    /**
     * Removes a relay set from the list.
     * @param relaySetNaddr - The relay set naddr to remove
     * @param publish - Whether to publish the change
     */
    async removeRelaySet(relaySetNaddr: string, publish = true): Promise<void> {
        await this.removeItemByValue(relaySetNaddr, publish);
    }
}

export default NDKRelayFeedList;
