# Mute Filtering

NDK provides automatic mute filtering for subscriptions, allowing applications to automatically hide content from muted
users or muted events.

## How It Works

When you set an active user, NDK automatically:

1. Fetches the user's mute list (kind 10000, per [NIP-51](https://nips.nostr.com/51))
2. Populates `ndk.mutedIds` with muted pubkeys and event IDs
3. Applies mute filtering to all subscriptions by default

## Default Behavior

By default, all subscriptions automatically filter out muted events:

```typescript
// Muted events are automatically filtered out
const sub = ndk.subscribe({ kinds: [1], limit: 50 });
sub.on('event', (event) => {
  // Will never receive events from muted authors or muted event IDs
  console.log(event.content);
});
```

## Including Muted Events

Sometimes you need to display muted content (e.g., in moderation interfaces or settings pages):

```typescript
// Opt-in to include muted events
const sub = ndk.subscribe(
  { kinds: [1], limit: 50 },
  { includeMuted: true }
);

sub.on('event', (event) => {
  if (event.muted()) {
    // This is a muted event - render with special styling
    renderMutedEvent(event);
  } else {
    renderNormalEvent(event);
  }
});
```

## Custom Mute Logic

You can customize the mute filter to implement your own mute logic:

```typescript
// Add keyword-based muting
ndk.muteFilter = (event: NDKEvent) => {
  // Check if author is muted
  if (ndk.mutedIds.has(event.pubkey)) return true;

  // Check if event ID is muted
  if (event.id && ndk.mutedIds.has(event.id)) return true;

  // Custom: mute based on content keywords
  const blockedWords = ['spam', 'scam'];
  if (blockedWords.some(word => event.content.includes(word))) {
    return true;
  }

  return false;
};
```

## Checking Mute Status

You can check if an individual event is muted:

```typescript
const muteReason = event.muted();
if (muteReason) {
  console.log(`Event is muted: ${muteReason}`);
  // muteReason will be "author" if the author is muted
  // or "event" if the specific event is muted
}
```

## Managing Mute Lists

NDK automatically manages mute lists when you have an active user:

```typescript
// Set active user - triggers automatic mute list fetch
ndk.activeUser = await ndk.signer.user();

// The mute list is automatically fetched and populated in ndk.mutedIds
// You can disable this by setting autoFetchUserMutelist: false in NDK constructor
const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.damus.io"],
  autoFetchUserMutelist: false  // Disable automatic mute list fetching
});
```

## Best Practices

1. **Use the default behavior**: Most applications should rely on automatic mute filtering
2. **Only use `includeMuted: true` when necessary**: Reserve this for moderation interfaces or user settings
3. **Customize the mute filter sparingly**: The default implementation covers most use cases
4. **Provide UI feedback**: When showing muted content, make it visually distinct (grayed out, collapsed, etc.)

## Example: Moderation Interface

Here's a complete example of a moderation interface that shows muted content:

```typescript
const sub = ndk.subscribe(
  { kinds: [1], authors: [userPubkey] },
  { includeMuted: true }
);

sub.on('event', (event) => {
  const muteStatus = event.muted();

  if (muteStatus) {
    // Render muted event with warning
    renderEvent({
      event,
      style: 'muted',
      warning: `This event is hidden because ${muteStatus === 'author' ? 'the author' : 'this specific event'} is muted`,
      showUnmuteButton: true
    });
  } else {
    renderEvent({ event, style: 'normal' });
  }
});
```
