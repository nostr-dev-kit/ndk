import NDK, { NDKEvent, type NDKRelay, type NDKRelaySet } from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://nos.lol"],
});

await ndk.connect();

const event = new NDKEvent(ndk, {
    kind: 1,
    content: "Hello Nostr!",
});

event.on("published", (data: { relaySet: NDKRelaySet; publishedToRelays: Set<NDKRelay> }) => {
    // Get all relays where the event was successfully published
    console.log("Published to:", data.publishedToRelays);
});
