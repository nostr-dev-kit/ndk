# Migration Guide: NDK 2.16

## Overview

NDK 2.16 introduces significant architectural changes that improve separation of concerns and fix reactivity issues. This release moves session-specific functionality (mutes, blocked relays) from NDK core to the `@nostr-dev-kit/sessions` package.

## Breaking Changes

### 0. Package Rename: @nostr-dev-kit/ndk-blossom → @nostr-dev-kit/blossom

The Blossom package has been renamed to remove the redundant "ndk-" prefix.

**Before:**

```typescript
import { NDKBlossom } from "@nostr-dev-kit/ndk-blossom";
```

**After:**

```typescript
import { NDKBlossom } from "@nostr-dev-kit/blossom";
```

**Migration Steps:**

1. Update your package.json:

    ```diff
    - "@nostr-dev-kit/ndk-blossom": "^2.0.0"
    + "@nostr-dev-kit/blossom": "^2.0.0"
    ```

2. Update all imports throughout your codebase:

    ```bash
    # Find all files that need updating
    grep -r "@nostr-dev-kit/ndk-blossom" .

    # Replace in all files (macOS/BSD)
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
      -exec sed -i '' 's/@nostr-dev-kit\/ndk-blossom/@nostr-dev-kit\/blossom/g' {} +

    # Or for Linux:
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
      -exec sed -i 's/@nostr-dev-kit\/ndk-blossom/@nostr-dev-kit\/blossom/g' {} +
    ```

All functionality remains identical - only the package name has changed.

### 1. Removed Properties from NDK

The following properties have been removed from the NDK class:

- `mutedIds: Map<Hexpubkey | NDKEventId, string>`
- `mutedWords: Set<string>`
- `blacklistRelayUrls: string[]`
- `autoFetchUserMutelist: boolean`
- `autoBlacklistInvalidRelays: boolean`

### 2. Removed Methods from NDK

- `blacklistRelay(url: string): void`

### 3. Removed Constants

- `DEFAULT_BLACKLISTED_RELAYS`

### 4. Changed Constructor Parameters

**NDKPool Constructor:**

**Before (2.15):**

```typescript
new NDKPool(
  relayUrls: string[],
  blacklistedRelayUrls: string[],  // ❌ Removed
  ndk: NDK,
  options?: { debug?, name? }
)
```

**After (2.16):**

```typescript
new NDKPool(
  relayUrls: string[],
  ndk: NDK,
  options?: { debug?, name? }
)
```

### 5. New Filter Callbacks

Two new optional filter callbacks have been added to NDK:

```typescript
interface NDKConstructorParams {
    /**
     * Custom filter function to determine if an event should be muted.
     * @param event - The event to check
     * @returns true if the event should be muted
     */
    muteFilter?: (event: NDKEvent) => boolean;

    /**
     * Custom filter function to determine if a relay connection should be allowed.
     * @param relayUrl - The relay URL to check
     * @returns true if the connection should be allowed, false to block it
     */
    relayConnectionFilter?: (relayUrl: string) => boolean;
}
```

---

## Migration Strategies

### Strategy 1: Using Sessions Package (Recommended)

If you're managing user sessions, the `@nostr-dev-kit/sessions` package now handles all mute and relay filtering automatically.

#### Installation

```bash
npm install @nostr-dev-kit/sessions
```

#### Before (2.15)

```typescript
import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    autoFetchUserMutelist: true,
    blacklistRelayUrls: ["wss://malicious.relay"],
});

await ndk.connect();

// Mutes were automatically fetched and stored in ndk.mutedIds
console.log(ndk.mutedIds.size); // Shows muted pubkeys
```

#### After (2.16)

```typescript
import NDK from "@nostr-dev-kit/ndk";
import { NDKSessionManager } from "@nostr-dev-kit/sessions";

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
});

await ndk.connect();

// Create session manager
const sessions = new NDKSessionManager(ndk);

// Login with signer - automatically fetches mutes and sets filters
await sessions.login(signer, {
    profile: true,
    follows: true,
    mutes: true, // Fetch mute list (kind 10000)
    blockedRelays: true, // Fetch blocked relays (kind 10001)
    relayList: true, // Fetch user relay list (kind 10002)
});

// Access mute data from active session
const muteCount = sessions.activeSession?.muteSet?.size ?? 0;
console.log(`Muted ${muteCount} pubkeys`);

// NDK filters are automatically set based on session data
```

**What Changed:**

- Mute data is now stored in session objects, not on NDK
- Sessions automatically set `ndk.muteFilter` and `ndk.relayConnectionFilter` based on active session
- Switching sessions automatically updates the filters

---

### Strategy 2: Manual Filter Implementation

If you're not using the sessions package, you can implement filters manually.

#### Before (2.15)

```typescript
const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    mutedIds: new Map([
        ["pubkey1", "p"],
        ["eventid1", "e"],
    ]),
    mutedWords: new Set(["spam", "offensive"]),
    blacklistRelayUrls: ["wss://bad.relay"],
});
```

#### After (2.16)

```typescript
// Store your mute data
const mutedIds = new Map<string, string>([
    ["pubkey1", "p"],
    ["eventid1", "e"],
]);

const mutedWords = new Set(["spam", "offensive"]);
const blockedRelays = new Set(["wss://bad.relay"]);

const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],

    // Implement mute filter
    muteFilter: (event) => {
        // Check if author is muted
        if (mutedIds.has(event.pubkey)) return true;

        // Check if event ID is muted
        if (event.id && mutedIds.has(event.id)) return true;

        // Check for muted words
        if (event.content && mutedWords.size > 0) {
            const lowerContent = event.content.toLowerCase();
            for (const word of mutedWords) {
                if (lowerContent.includes(word)) return true;
            }
        }

        return false;
    },

    // Implement relay connection filter
    relayConnectionFilter: (relayUrl) => {
        return !blockedRelays.has(relayUrl);
    },
});
```

---

### Strategy 3: Migrating Existing Blacklist Code

If you were using the blacklist functionality:

#### Before (2.15)

```typescript
const ndk = new NDK({
    blacklistRelayUrls: ["wss://bad1.relay", "wss://bad2.relay"],
    autoBlacklistInvalidRelays: true,
});

// Dynamically blacklist a relay
ndk.blacklistRelay("wss://spam.relay");
```

#### After (2.16)

```typescript
// Store blocked relays in a Set
const blockedRelays = new Set(["wss://bad1.relay", "wss://bad2.relay"]);

const ndk = new NDK({
    relayConnectionFilter: (relayUrl) => {
        return !blockedRelays.has(relayUrl);
    },
});

// Dynamically block a relay
function blockRelay(url: string) {
    blockedRelays.add(url);

    // Disconnect if connected
    const relay = ndk.pool.getRelay(url, false, false);
    if (relay) {
        relay.disconnect();
    }
}

// Listen for invalid signatures and block relays
ndk.on("event:invalid-sig", (event, relay) => {
    if (relay) {
        console.log(`Invalid signature from ${relay.url}, blocking...`);
        blockRelay(relay.url);
    }
});
```

---

## Event.muted() Changes

The `NDKEvent.muted()` method return value has changed:

### Before (2.15)

```typescript
const reason = event.muted();
// Returns: "author" | "event" | null
```

### After (2.16)

```typescript
const reason = event.muted();
// Returns: "muted" | null
// (simplified - no longer distinguishes between author/event muting)
```

If you need to determine the specific reason, check the filter yourself:

```typescript
function getMuteReason(event: NDKEvent): string | null {
    if (!ndk.muteFilter || !ndk.muteFilter(event)) {
        return null;
    }

    // Check your own mute data structure
    if (mutedIds.has(event.pubkey)) return "author";
    if (event.id && mutedIds.has(event.id)) return "event";

    // Check for muted words
    if (event.content && mutedWords.size > 0) {
        const lowerContent = event.content.toLowerCase();
        for (const word of mutedWords) {
            if (lowerContent.includes(word)) return "word";
        }
    }

    return "muted";
}
```

---

## Subscription Options

Subscriptions now check the `muteFilter` automatically:

### Before (2.15)

```typescript
// Events from muted users were automatically filtered
// based on ndk.mutedIds
const sub = ndk.subscribe([{ kinds: [1] }]);
```

### After (2.16)

```typescript
// Events are filtered if ndk.muteFilter returns true
const sub = ndk.subscribe([{ kinds: [1] }]);

// To include muted events:
const subWithMuted = ndk.subscribe([{ kinds: [1] }], { includeMuted: true });
```

---

## Using with @nostr-dev-kit/svelte

If you're using the Svelte package, the sessions store handles everything automatically:

```typescript
import { createNDK } from "@nostr-dev-kit/svelte";
import { sessions } from "@nostr-dev-kit/svelte/stores";

const ndk = createNDK();

// Login - mutes and filters are handled automatically
await sessions.login(signer, {
    mutes: true,
    blockedRelays: true,
});

// Access reactive mute data
const muteCount = $derived(sessions.mutes.size);
const blockedRelayCount = $derived(sessions.blockedRelays.size);
```

---

## Testing Your Migration

After migrating, verify that:

1. **Muted events are filtered correctly:**

```typescript
const testEvent = new NDKEvent(ndk);
testEvent.pubkey = "muted-pubkey";

const isMuted = ndk.muteFilter?.(testEvent) ?? false;
console.log("Event is muted:", isMuted); // Should be true
```

2. **Blocked relays are not connected:**

```typescript
const blockedUrl = "wss://blocked.relay";
const canConnect = ndk.relayConnectionFilter?.(blockedUrl) ?? true;
console.log("Can connect:", canConnect); // Should be false
```

3. **Sessions work correctly (if using sessions package):**

```typescript
await sessions.login(signer, { mutes: true });
console.log("Mutes loaded:", sessions.activeSession?.muteSet?.size);
```

---

## Common Issues

### Issue: "Events not being filtered"

**Problem:** Events from muted users are still appearing.

**Solution:** Make sure you've set the `muteFilter` on NDK:

```typescript
const ndk = new NDK({
    muteFilter: (event) => {
        // Your mute logic here
        return mutedIds.has(event.pubkey);
    },
});
```

### Issue: "Relay connections not blocked"

**Problem:** NDK is still connecting to blocked relays.

**Solution:** Set the `relayConnectionFilter`:

```typescript
const ndk = new NDK({
    relayConnectionFilter: (relayUrl) => {
        return !blockedRelays.has(relayUrl);
    },
});
```

### Issue: "NDKPool constructor error"

**Problem:** `TypeError: Expected 3-4 arguments, got 5`

**Solution:** Remove the `blacklistedRelayUrls` parameter:

```typescript
// ❌ Old (2.15)
new NDKPool(relayUrls, blacklistedUrls, ndk, options);

// ✅ New (2.16)
new NDKPool(relayUrls, ndk, options);
```

---

## Benefits of This Change

1. **Better Separation of Concerns:** Session-specific data belongs in the sessions package, not NDK core
2. **Improved Reactivity:** Session data is now reactive by default when using the sessions package
3. **More Flexible:** Custom filter callbacks allow for any filtering logic
4. **Cleaner API:** Removes session-specific properties from the core NDK interface
5. **Multi-User Support:** Different sessions can have different mute lists and relay filters

---

## Need Help?

- **Documentation:** [NDK Documentation](https://github.com/nostr-dev-kit/ndk)
- **Sessions Package:** [@nostr-dev-kit/sessions](https://github.com/nostr-dev-kit/ndk/tree/master/sessions)
- **Issues:** [GitHub Issues](https://github.com/nostr-dev-kit/ndk/issues)
- **Discord:** Nostr Dev Kit server

---

**Ready to migrate? Your code will be cleaner and more maintainable! ✨**
