import NDK, { type NDKRelay } from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
});

// Main pool events
ndk.pool.on("relay:connecting", (relay: NDKRelay) => {
    console.log(`⟳ [Main Pool] Connecting to relay: ${relay.url}`);
});

ndk.pool.on("relay:connect", (relay: NDKRelay) => {
    console.log(`✓ [Main Pool] Connected to relay: ${relay.url}`);
});

ndk.pool.on("relay:disconnect", (relay: NDKRelay) => {
    console.log(`✗ [Main Pool] Disconnected from relay: ${relay.url}`);
});
