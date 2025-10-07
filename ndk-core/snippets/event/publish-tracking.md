# Event Publish Tracking

NDK provides comprehensive tracking of where events are published and the status of each publish attempt.

## Basic Usage

When you publish an event, NDK tracks the status of each relay:

```typescript
import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://nos.lol"],
});

await ndk.connect();

const event = new NDKEvent(ndk, {
    kind: 1,
    content: "Hello Nostr!",
});

try {
    await event.publish();

    // Get all relays where the event was successfully published
    console.log("Published to:", event.publishedToRelays);
    // Output: ["wss://relay.damus.io", "wss://nos.lol"]

    // Check if published to a specific relay
    if (event.wasPublishedTo("wss://relay.damus.io")) {
        console.log("Successfully published to Damus relay");
    }
} catch (error) {
    // Even if publish fails, you can see which relays succeeded
    console.log("Published to:", event.publishedToRelays);

    // Get failed relays and their errors
    const failures = event.failedPublishesToRelays;
    for (const [relay, error] of failures) {
        console.error(`Failed to publish to ${relay}:`, error.message);
    }
}
```

## Detailed Status Information

Each relay has detailed status information including timestamps:

```typescript
// Get detailed status for all relays
for (const [relayUrl, status] of event.publishRelayStatus) {
    console.log(`Relay: ${relayUrl}`);
    console.log(`  Status: ${status.status}`); // "pending", "success", or "error"
    console.log(`  Timestamp: ${new Date(status.timestamp)}`);
    if (status.error) {
        console.log(`  Error: ${status.error.message}`);
    }
}
```

## Handling Partial Failures

When publishing to multiple relays, some may succeed while others fail:

```typescript
try {
    // Require at least 2 relays to receive the event
    await event.publish(undefined, 5000, 2);
} catch (error) {
    if (error instanceof NDKPublishError) {
        console.log("Published to", error.publishedToRelays.size, "relays");
        console.log("Failed on", error.errors.size, "relays");

        // The event object still tracks all statuses
        console.log("Successful relays:", event.publishedToRelays);
        console.log("Failed relays:", Array.from(event.failedPublishesToRelays.keys()));
    }
}
```

## Custom Relay Sets

You can publish to specific relay sets and track their status:

```typescript
const customRelaySet = NDKRelaySet.fromRelayUrls(
    ["wss://relay.snort.social", "wss://relay.primal.net"],
    ndk,
);

await event.publish(customRelaySet);

// Check which of the custom relays received the event
for (const relayUrl of customRelaySet.relayUrls) {
    if (event.wasPublishedTo(relayUrl)) {
        console.log(`✓ Published to ${relayUrl}`);
    } else {
        console.log(`✗ Failed to publish to ${relayUrl}`);
    }
}
```

## Republishing Events

When republishing an event, the relay status is cleared and updated:

```typescript
// First publish attempt
await event.publish();
console.log("First publish:", event.publishedToRelays);

// Republish to different relays
const newRelaySet = NDKRelaySet.fromRelayUrls(["wss://relay.nostr.bg", "wss://nostr.wine"], ndk);

await event.publish(newRelaySet);
console.log("Second publish:", event.publishedToRelays);
// Only shows relays from the second publish
```

## Monitoring Relay Performance

You can use publish tracking to monitor relay performance:

```typescript
const publishStats = new Map<string, { success: number; failure: number }>();

// Track multiple publishes
for (const event of events) {
    await event.publish();

    for (const [relay, status] of event.publishRelayStatus) {
        const stats = publishStats.get(relay) || { success: 0, failure: 0 };
        if (status.status === "success") {
            stats.success++;
        } else if (status.status === "error") {
            stats.failure++;
        }
        publishStats.set(relay, stats);
    }
}

// Analyze relay performance
for (const [relay, stats] of publishStats) {
    const total = stats.success + stats.failure;
    const successRate = ((stats.success / total) * 100).toFixed(1);
    console.log(`${relay}: ${successRate}% success rate`);
}
```

## Event Status Properties

- `event.publishedToRelays` - Array of relay URLs where the event was successfully published
- `event.failedPublishesToRelays` - Map of relay URLs to their errors
- `event.publishRelayStatus` - Map of all relay URLs to their detailed status
- `event.wasPublishedTo(url)` - Check if successfully published to a specific relay
- `event.publishStatus` - Overall status: "pending", "success", or "error"
- `event.publishError` - Error if the overall publish failed
