import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    devWriteRelayUrls: ["wss://staging.relay", "wss://another.test.relay"],
});

await ndk.connect();
