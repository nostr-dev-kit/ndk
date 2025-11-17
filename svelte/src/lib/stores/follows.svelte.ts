import type { Hexpubkey, NDKRelay } from "@nostr-dev-kit/ndk";
import type { ReactiveSessionsStore } from "./sessions.svelte";

/**
 * Proxy object for follows that extends Set with add/remove methods
 * that publish to the network
 */
export class FollowsProxy {
    #store: ReactiveSessionsStore;
    #followSet: Set<Hexpubkey>;

    constructor(store: ReactiveSessionsStore, followSet: Set<Hexpubkey>) {
        this.#store = store;
        this.#followSet = followSet;
    }

    /**
     * Add a follow to the current user's contact list
     *
     * @param pubkey - The pubkey to follow
     * @returns Promise that resolves to true if follow was added, false if already following
     */
    async add(pubkey: Hexpubkey): Promise<boolean> {
        const user = this.#store.currentUser;
        if (!user) throw new Error("No active user");
        return await user.follow(pubkey, this.#followSet);
    }

    /**
     * Remove a follow from the current user's contact list
     *
     * @param pubkey - The pubkey to unfollow
     * @returns Promise that resolves to the relays where the update was published, or false if not following
     */
    async remove(pubkey: Hexpubkey): Promise<Set<NDKRelay> | boolean> {
        const user = this.#store.currentUser;
        if (!user) throw new Error("No active user");
        return await user.unfollow(pubkey, this.#followSet);
    }

    /**
     * Toggle follow status for a user
     *
     * @param pubkey - The pubkey to toggle
     * @returns Promise that resolves when action is complete
     */
    async toggle(pubkey: Hexpubkey): Promise<void> {
        if (this.#followSet.has(pubkey)) {
            await this.remove(pubkey);
        } else {
            await this.add(pubkey);
        }
    }

    // Delegate all Set methods to the underlying Set
    has(pubkey: Hexpubkey): boolean {
        return this.#followSet.has(pubkey);
    }

    get size(): number {
        return this.#followSet.size;
    }

    [Symbol.iterator]() {
        return this.#followSet[Symbol.iterator]();
    }

    values() {
        return this.#followSet.values();
    }

    keys() {
        return this.#followSet.keys();
    }

    entries() {
        return this.#followSet.entries();
    }

    forEach(callback: (value: Hexpubkey, key: Hexpubkey, set: Set<Hexpubkey>) => void, thisArg?: any) {
        return this.#followSet.forEach(callback, thisArg);
    }
}
