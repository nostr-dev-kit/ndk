# Local first

NDK allows for local-first software.

This mode of operation depends on a few key things:

* A cache adapter must be present
* Events `event:publish-failed` should be handled by the application

A few considerations:

* Failed events are automatically retried by NDK
* Handling of failed events is up to the application; handling here exclusively refers to notifying the user and
  updating the UI accordingly

## Blocked publishing

The default behavior when publishing an event will make `event.publish()` block
until the event has been published or a failure has ocurred.

```ts
const event = new NDKEvent(ndk, { kind: 1, content: 'Blocking event' });
const publishedToRelays = await event.publish();
console.log(publishedToRelays); // relays where the event has published to
```

## Optimistic publishing

If you want to publish an event without waiting for it to be published, you can use the `event.publish()` method.

```ts
const event = new NDKEvent(ndk, { kind: 1, content: 'Optimistic event' });
event.publish();
```

When using a cache adapter that supports unpublished event tracking (like `NDKCacheAdapterDexie`), the event will be
first
written to the cache and then published to relays. When a minimal amount of relays have successfully received the event,
the event will be removed from the cache.

With this technique you can fire and forget event publshing.

## Handling persistent failures

When an event fails to publish, you can handle the failure by listening to the `event.failed` event.

You should handle this event to notify the user that the event has failed to publish and update the UI accordingly.

```ts
// application-wide
function handlePublishingFailures(event: NDKEvent, error: NDKPublishError) {
  console.log(`Event ${event.id} failed to publish`, { publishedToRelays: error.publishedToRelays });
}

ndk.on("event:publish-failed", handlePublishingFailures);
const event = new NDKEvent(ndk, { kind: 1, content: 'Failing event' });
event.publish();
```

## Querying cached failed events

Cache adapters with support for failed publish tracking can be queried via the `getUnpublishedEvents` interface.

```ts
const failedEvents = ndk.cachedAdapter.getUnpublishedEvents()

console.log(failedEvents.length + " events have not published before; trying now");
failedEvents.forEach((event) => event.publish());
```

When an event successfully publishes, the event will emit `published`.

## Handling retries

When booting up your application, NDK will automatically reattempt to publish any events that have failed to publish in
the past.
