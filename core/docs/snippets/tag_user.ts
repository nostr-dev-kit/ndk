import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

const ndk = new NDK();
const event = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content:
        "Hello, nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft this is a test from an NDK snippet.",
});
await event.sign();
