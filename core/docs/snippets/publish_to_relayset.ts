import NDK, { NDKEvent, NDKRelaySet } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello world";

const customRelaySet = NDKRelaySet.fromRelayUrls(["wss://relay.snort.social", "wss://relay.primal.net"], ndk);
await event.publish(customRelaySet);
