import NDK, { nip19 } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

const eventId = "aef62d07b65b80974f0bd8d6b8fc85e4ffcdf34c86de40e5c92aa5654b7a91d4";
const pubkey = "a6f6b6a535ba73f593579e919690b7c29df3ba0d764790326c1d3b68d0bfde2e";

// Create shareable event reference with relay hints
const event = await ndk.fetchEvent(eventId);

if (event) {
    const shareableLink = event.encode(3); // Include up to 3 relay hints

    const nprofile = nip19.nprofileEncode({
        pubkey: pubkey,
        relays: ["wss://relay.damus.io", "wss://nos.lol"],
    });
}
