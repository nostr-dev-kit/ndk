import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK();

ndk.subscribe(
    { kinds: [1] }, // Filters
    { closeOnEose: true }, // Options (no explicit relays specified)
);
