import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK();
const existingEvent = await ndk.fetchEvent("574033c986bea1d7493738b46fec1bb98dd6a826391d6aa893137e89790027ec"); // fetch the event to replace

if (existingEvent) {
    existingEvent.tags.push(
        ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"], // follow a new user
    );
    existingEvent.publish(); // this will NOT work
    existingEvent.publishReplaceable(); // this WILL work
}
