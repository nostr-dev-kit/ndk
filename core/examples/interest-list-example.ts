import { NDKInterestList } from "../src/events/kinds/interest-list.js";
import NDK from "../src/ndk/index.js";
import { NDKPrivateKeySigner } from "../src/signers/private-key/index.js";

/**
 * Example: Create and manage a user's Interest List (NIP-51)
 *
 * Interest lists (kind 10015) allow users to define topics they're interested in
 * using "t" tags for hashtags.
 */

async function main() {
    // Initialize NDK
    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
    });

    // Create a signer (in production, use proper key management)
    const signer = NDKPrivateKeySigner.generate();
    ndk.signer = signer;

    await ndk.connect();

    console.log("Creating interest list...");

    // Create a new interest list
    const interestList = new NDKInterestList(ndk);

    // Add individual interests
    interestList.addInterest("nostr");
    interestList.addInterest("bitcoin");
    interestList.addInterest("technology");
    interestList.addInterest("privacy");

    // Set a title for the list (optional)
    interestList.title = "My Interests";
    interestList.description = "Topics I'm passionate about";

    console.log("Interests:", interestList.interests);
    console.log("Has 'nostr'?", interestList.hasInterest("nostr"));
    console.log("Has 'ethereum'?", interestList.hasInterest("ethereum"));

    // Sign and publish the list
    await interestList.sign();
    await interestList.publish();

    console.log("Interest list published!");
    console.log("Event ID:", interestList.id);

    // Fetch the user's interest list
    console.log("\nFetching interest list...");
    const user = await signer.user();
    const lists = await ndk.fetchEvents({
        kinds: [10015],
        authors: [user.pubkey],
    });

    for (const list of lists) {
        const interestList = NDKInterestList.from(list);
        console.log("Found interest list with", interestList.interests.length, "interests");
        console.log("Interests:", interestList.interests);
    }

    // Update the list - remove an interest
    console.log("\nUpdating interest list...");
    interestList.removeInterest("technology");
    interestList.addInterest("cryptography");

    console.log("Updated interests:", interestList.interests);

    // Publish the updated list
    await interestList.publishReplaceable();
    console.log("Updated list published!");

    // Alternatively, set all interests at once
    const newList = new NDKInterestList(ndk);
    newList.interests = ["nostr", "bitcoin", "lightning", "privacy", "decentralization"];
    newList.title = "Core Interests";

    console.log("\nCreating new list with bulk interests...");
    console.log("New list interests:", newList.interests);

    await newList.sign();
    await newList.publish();
    console.log("New list published!");

    // Cleanup
    ndk.pool.disconnect();
}

main().catch(console.error);
