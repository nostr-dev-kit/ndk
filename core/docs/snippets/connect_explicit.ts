// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
});

// Now connect to specified relays
await ndk.connect();
