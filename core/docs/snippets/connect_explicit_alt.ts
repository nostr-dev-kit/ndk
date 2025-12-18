// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK();

ndk.addExplicitRelay("wss://relay.damus.io");
ndk.addExplicitRelay("wss://nos.lol");
ndk.addExplicitRelay("wss://relay.nostr.band");

// Now connect to specified relays
await ndk.connect();
