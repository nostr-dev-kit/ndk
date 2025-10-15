import NDK, { NDKInterestList, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
});

// Create a signer (in production, use proper key management)
const signer = NDKPrivateKeySigner.generate();
ndk.signer = signer;

await ndk.connect();

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

console.log("Has 'nostr'?", interestList.hasInterest("nostr"));
console.log("Has 'ethereum'?", interestList.hasInterest("ethereum"));

// Publish the list (which also signs)
await interestList.publish();
