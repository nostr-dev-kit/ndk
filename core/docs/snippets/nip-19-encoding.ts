import { nip19 } from "@nostr-dev-kit/ndk";

const pubkey = "a6f6b6a535ba73f593579e919690b7c29df3ba0d764790326c1d3b68d0bfde2e";
const privateKey = "df63bea84840e5fd07961af1c76286aa628264ad5f151546007530551fb8068f";
const eventId = "aef62d07b65b80974f0bd8d6b8fc85e4ffcdf34c86de40e5c92aa5654b7a91d4";

// Encoding
const npub = nip19.npubEncode(pubkey);
const nsec = nip19.nsecEncode(privateKey);
const note = nip19.noteEncode(eventId);

// Encoding with metadata
const nprofile = nip19.nprofileEncode({
    pubkey: "hexPubkey",
    relays: ["wss://relay1.example.com", "wss://relay2.example.com"],
});

const nevent = nip19.neventEncode({
    id: eventId,
    relays: ["wss://relay.example.com"],
    author: pubkey,
});

const naddr = nip19.naddrEncode({
    kind: 30023,
    pubkey: pubkey,
    identifier: "article-slug",
    relays: ["wss://relay.example.com"],
});
