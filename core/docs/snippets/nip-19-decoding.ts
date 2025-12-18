import { nip19 } from "@nostr-dev-kit/ndk";

// Decoding
const decoded = nip19.decode("npub1...");
console.log(decoded.type); // "npub"
console.log(decoded.data); // hex pubkey

// Type-specific decoding
if (decoded.type === "nprofile") {
    console.log(decoded.data.pubkey);
    console.log(decoded.data.relays);
}
