import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

const ndk = new NDK(/* initialization options for the ndk singleton */);

const event = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: "Hello world",
});
