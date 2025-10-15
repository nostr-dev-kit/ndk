# Publishing Events

Publishing events means sending them to one or multiple relays as described in 
[NIP-01](https://nostr-nips.com/nip-01#communication-between-clients-and-relays).

NDK provides easy ways to publish events and manage the status of that event.

> [!NOTE]
> Please note that the behavior of `.publish()` requires a valid signer and will only publish the events to the
configured relays. More about relay interaction in the [connecting documentation](/core/docs/fundamentals/connecting.md).

## Publishing Events

The easiest way to publish an event is to use the `publish()` method on the event object.

<<< @/core/docs/snippets/publish_event.ts

This will sign the event and send it to the network.

## Publishing Replaceable Events

Some events in Nostr allow for replacement.

Kinds `0`, `3`, range `10000-19999`. Range `30000-39999` is dedicated for parameterized replaceable events, 
which means that multiple events of the same kind under the same pubkey can exist and are differentiated via 
their `d` tag.

Since replaceable events depend on having a newer `created_at`, NDK provides a convenience method to reset `id`, `sig`, 
and `created_at` to allow for easy replacement: `event.publishReplaceable()`

<<< @/core/docs/snippets/replace_event.ts

## Event Status Properties

- `event.publishedToRelays` - Array of relay URLs where the event was successfully published
- `event.failedPublishesToRelays` - Map of relay URLs to their errors
- `event.publishRelayStatus` - Map of all relay URLs to their detailed status
- `event.wasPublishedTo(url)` - Check if successfully published to a specific relay
- `event.publishStatus` - Overall status: "pending", "success", or "error"
- `event.publishError` - Error if the overall publish failed

## More

Read more about the [local-first](local-first.md) mode of operation.