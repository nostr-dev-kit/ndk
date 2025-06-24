# Tagging users and events

NDK automatically adds the appropriate tags for mentions in the content.

If the user wants to mention a user or an event, NDK will automatically add the appropriate tags:

## Tagging a user

```ts
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

const event = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content:
        "Hello, nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft this is a test from an NDK snippet.",
});
await event.sign();
```

Calling `event.sign()` will finalize the event, adding the appropriate tags, The resulting event will look like:

```json
{
    "created_at": 1742904504,
    "content": "Hello, nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft this is a test from an NDK snippet.",
    "tags": [["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"]],
    "kind": 1,
    "pubkey": "cbf66fa8cf9877ba98cd218a96d77bed5abdbfd56fdd3d0393d7859d58a313fb",
    "id": "26df08155ceb82de8995081bf63a36017cbfd3a616fe49820d8427d22e0af20f",
    "sig": "eb6125248cf4375d650b13fa284e81f4270eaa8cb3cae6366ab8cda27dc99c1babe5b5a2782244a9673644f53efa72aba6973ac3fc5465cf334413d90f4ea1b0"
}
```
