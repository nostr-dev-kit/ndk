import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

const ndk = new NDK();
const event = new NDKEvent(ndk);
event.kind = NDKKind.Metadata;
event.content = JSON.stringify({
    name: "Johnny",
    about: "I come from nowhere",
});
// first publish
await event.publish();

// this will republish/broadcast the same event
await event.publish();

// this will create a new event and publish it
await event.publishReplaceable(); // [!code focus]
