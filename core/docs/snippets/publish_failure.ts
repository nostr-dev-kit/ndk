import NDK, { NDKEvent, type NDKPublishError } from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://non.existing.relay", "wss://nos.lol"],
});

await ndk.connect();

const event = new NDKEvent(ndk, {
    kind: 1,
    content: "Hello Nostr!",
});

ndk.on(`event:publish-failed`, (event: NDKEvent, error: NDKPublishError, relays: WebSocket["url"][]) => {
    console.log("Event failed to publish on", event, relays, error);
});

await event.publish();
