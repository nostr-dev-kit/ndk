# Publishing Events

## Optimistic publish lifecycle

Read more about the [local-first](./local-first.md) mode of operation.

## Publishing Replaceable Events

Some events in Nostr allow for replacement.

Kinds `0`, `3`, range `10000-19999`.

Range `30000-39999` is parameterized replaceable events, which means that multiple events of the same kind under the
same pubkey can exist and are differentiated via their `d` tag.

Since replaceable events depend on having a newer `created_at`, NDK provides a convenience method to reset `id`, `sig`,
and `created_at` to allow for easy replacement: `event.publishReplaceable()`

```ts
const existingEvent = await ndk.fetchEvent({ kinds: [0], authors: [<user-pubkey>]}); // fetch the event to replace
existingEvent.tags.push(
    [ "p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" ] // follow a new user
);
existingEvent.publish(); // this will NOT work
existingEvent.publishReplaceable(); // this WILL work
```
