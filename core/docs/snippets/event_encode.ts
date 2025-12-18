import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello Nostr!";
await event.sign();

// Automatically chooses the right format:
// - naddr for parameterized replaceable events
// - nevent for events with relay information
// - note for simple note references
const encoded = event.encode();

// Control relay hints
const encodedWith5Relays = event.encode(5); // Include up to 5 relay hints
