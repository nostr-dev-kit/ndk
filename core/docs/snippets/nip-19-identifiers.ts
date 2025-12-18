import { nip19 } from "@nostr-dev-kit/ndk";

// Encode a pubkey as npub
const npub = nip19.npubEncode("3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d");
console.log(npub); //

// Decode any NIP-19 identifier
const decoded = nip19.decode("npub1...");
console.log(decoded.type); // "npub"
console.log(decoded.data); // hex pubkey

// Encode events
const nevent = nip19.neventEncode({
    id: "574033c986bea1d7493738b46fec1bb98dd6a826391d6aa893137e89790027ec",
    relays: ["wss://relay.example.com"],
    author: "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
});

console.log(nevent);
