# Basic Feed Example

A simple Nostr feed viewer using ndk-svelte5.

## Features

- Real-time event streaming
- Reactive subscription management
- Automatic mute filtering
- Profile caching
- Zero manual cleanup

## Running the Example

```bash
npm install
npm run dev
```

## Code Structure

- `App.svelte` - Main feed component
- `lib/ndk.ts` - NDK configuration
- `lib/stores.ts` - Global store initialization

## Key Concepts Demonstrated

### 1. Reactive Subscriptions

```svelte
const notes = ndk.subscribeReactive([{ kinds: [1], limit: 50 }]);
```

Subscriptions are automatically reactive. Access `notes.events`, `notes.eosed`, `notes.count` directly.

### 2. Automatic Cleanup

No need for `onDestroy` or manual cleanup. Subscriptions stop automatically when components unmount.

### 3. Profile Integration

```svelte
{@const profile = profiles.get(note.pubkey)}
<img src={profile?.image} alt={profile?.name} />
```

Profiles are fetched automatically and cached globally.

### 4. Mute Filtering

```svelte
const notes = ndk.subscribeReactive([{ kinds: [1] }], {
  skipMuted: true  // Default behavior
});
```

Muted content is filtered automatically.

## Learn More

- [ndk-svelte5 Documentation](../../README.md)
- [API Reference](../../API.md)
- [More Examples](../)
