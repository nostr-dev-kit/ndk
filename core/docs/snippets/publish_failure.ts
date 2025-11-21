import NDK, { NDKEvent, type NDKPublishError } from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://nos.lol"],
});

await ndk.connect();

const event = new NDKEvent(ndk, {
    kind: 1,
    content: "Hello Nostr!",
});

ndk.on(`event:publish-failed`, (event: NDKEvent, error: NDKPublishError, relays: WebSocket["url"][]) => {
    console.log("Event failed to publish on", relays, error);
});
