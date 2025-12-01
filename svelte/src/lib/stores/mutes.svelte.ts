import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { ReactiveSessionsStore } from "./sessions.svelte";

/**
 * Proxy object for mutes that extends Set with mute/unmute methods
 * that publish to the network
 */
export class MutesProxy {
  #store: ReactiveSessionsStore;
  #muteSet: Set<Hexpubkey>;

  constructor(store: ReactiveSessionsStore, muteSet: Set<Hexpubkey>) {
    this.#store = store;
    this.#muteSet = muteSet;
  }

  /**
   * Mute a user
   *
   * @param pubkey - The pubkey to mute
   * @returns Promise that resolves when mute is published
   */
  async mute(pubkey: Hexpubkey): Promise<void> {
    const user = this.#store.currentUser;
    if (!user) throw new Error("No active user");
    if (!user.ndk) throw new Error("No NDK instance found");

    user.ndk.assertSigner();

    // Check if already muted
    if (this.#muteSet.has(pubkey)) return;

    // Add to mute set
    this.#muteSet.add(pubkey);

    // Create and publish mute list event (kind 10000)
    const event = new NDKEvent(user.ndk, {
      kind: NDKKind.MuteList,
      content: "",
      tags: [],
    });

    // Add all muted pubkeys as p tags
    for (const mutedPubkey of this.#muteSet) {
      event.tags.push(["p", mutedPubkey]);
    }

    await event.publishReplaceable();
  }

  /**
   * Unmute a user
   *
   * @param pubkey - The pubkey to unmute
   * @returns Promise that resolves when unmute is published
   */
  async unmute(pubkey: Hexpubkey): Promise<void> {
    const user = this.#store.currentUser;
    if (!user) throw new Error("No active user");
    if (!user.ndk) throw new Error("No NDK instance found");

    user.ndk.assertSigner();

    // Check if currently muted
    if (!this.#muteSet.has(pubkey)) return;

    // Remove from mute set
    this.#muteSet.delete(pubkey);

    // Create and publish updated mute list event (kind 10000)
    const event = new NDKEvent(user.ndk, {
      kind: NDKKind.MuteList,
      content: "",
      tags: [],
    });

    // Add all remaining muted pubkeys as p tags
    for (const mutedPubkey of this.#muteSet) {
      event.tags.push(["p", mutedPubkey]);
    }

    await event.publishReplaceable();
  }

  /**
   * Toggle mute status for a user
   *
   * @param pubkey - The pubkey to toggle
   * @returns Promise that resolves when action is complete
   */
  async toggle(pubkey: Hexpubkey): Promise<void> {
    if (this.#muteSet.has(pubkey)) {
      await this.unmute(pubkey);
    } else {
      await this.mute(pubkey);
    }
  }

  // Delegate all Set methods to the underlying Set
  has(pubkey: Hexpubkey): boolean {
    return this.#muteSet.has(pubkey);
  }

  get size(): number {
    return this.#muteSet.size;
  }

  [Symbol.iterator]() {
    return this.#muteSet[Symbol.iterator]();
  }

  values() {
    return this.#muteSet.values();
  }

  keys() {
    return this.#muteSet.keys();
  }

  entries() {
    return this.#muteSet.entries();
  }

  forEach(
    callback: (value: Hexpubkey, key: Hexpubkey, set: Set<Hexpubkey>) => void,
    thisArg?: any,
  ) {
    return this.#muteSet.forEach(callback, thisArg);
  }
}
