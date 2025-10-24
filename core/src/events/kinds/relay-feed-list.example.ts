/**
 * Examples of using NDKRelayFeedList (NIP-51 kind 10012)
 *
 * This kind represents user's favorite browsable relays and relay sets.
 * It can contain both individual relay URLs and references to relay sets (kind:30002).
 */

import { NDK } from "../../ndk/index.js";
import { NDKPrivateKeySigner } from "../../signers/private-key/index.js";
import { NDKRelayFeedList } from "./relay-feed-list.js";

async function createRelayFeedList() {
    // Initialize NDK with a signer
    const ndk = new NDK();
    const signer = NDKPrivateKeySigner.generate();
    ndk.signer = signer;

    // Create a new relay feed list
    const relayFeedList = new NDKRelayFeedList(ndk);
    relayFeedList.title = "My Favorite Relays";
    relayFeedList.description = "Relays I browse regularly";

    // Add individual relay URLs
    await relayFeedList.addRelay("wss://relay.damus.io");
    await relayFeedList.addRelay("wss://nos.lol");
    await relayFeedList.addRelay("wss://relay.nostr.band");

    // Add relay set references (kind:30002)
    await relayFeedList.addRelaySet("30002:pubkey123:my-outbox-relays");
    await relayFeedList.addRelaySet("30002:pubkey456:trusted-relays");

    // Publish the list
    await relayFeedList.publish();

    return relayFeedList;
}

async function readRelayFeedList() {
    const ndk = new NDK();
    const signer = NDKPrivateKeySigner.generate();
    ndk.signer = signer;

    // Fetch the user's relay feed list
    const user = await signer.user();
    const lists = await ndk.fetchEvents({
        kinds: [10012],
        authors: [user.pubkey],
    });

    for (const event of lists) {
        const relayFeedList = NDKRelayFeedList.from(event);

        console.log("Title:", relayFeedList.title);
        console.log("Description:", relayFeedList.description);

        // Get all relay URLs
        console.log("Relay URLs:", relayFeedList.relayUrls);

        // Get all relay set references
        console.log("Relay Sets:", relayFeedList.relaySets);
    }
}

async function modifyRelayFeedList() {
    const ndk = new NDK();
    const signer = NDKPrivateKeySigner.generate();
    ndk.signer = signer;

    const relayFeedList = new NDKRelayFeedList(ndk);

    // Add some relays
    await relayFeedList.addRelay("wss://relay.damus.io");
    await relayFeedList.addRelay("wss://nos.lol");

    // Remove a relay (don't publish yet)
    await relayFeedList.removeRelay("wss://nos.lol", false);

    // Add it back at the top of the list
    await relayFeedList.addRelay("wss://nos.lol", undefined, false, "top");

    // Publish all changes at once
    await relayFeedList.publish();
}

// Export examples for documentation purposes
export { createRelayFeedList, modifyRelayFeedList, readRelayFeedList };
