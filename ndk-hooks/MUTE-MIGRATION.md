# Mute Store Migration Guide

## Overview

The muting functionality in NDK Hooks has been refactored from the session store to a dedicated mute store. This guide will help you migrate your code to use the new mute store and hooks.

## Breaking Changes

This refactoring introduces several breaking changes:

1. Mute-related properties have been removed from the session store
2. The `useMuteList` hook now returns data from the mute store instead of the session store
3. All mute-related hooks have been moved to a dedicated module
4. Property naming has been simplified (removed "muted" prefix in *Mute* types)

## Migration Steps

### 1. Update Imports

Replace imports from the common hooks with imports from the new mute hooks:

```diff
- import { useMuteFilter, useMuteItem } from "ndk-hooks/src/common/hooks/mute";
+ import { useMuteFilter, useMuteItem } from "ndk-hooks";
```

### 2. Update Session Store Access

If you were directly accessing mute-related properties from the session store, update to use the mute store:

```diff
- const mutedPubkeys = useNDKSessions(s => s.sessions.get(pubkey)?.mutedPubkeys);
+ import { useNDKMutes } from "ndk-hooks";
+ const mutedPubkeys = useNDKMutes(s => s.mutes.get(pubkey)?.pubkeys);
```

### 3. Update Hook Usage

The mute hooks have been updated with cleaner APIs:

#### Before:

```javascript
// Old approach
const muteItem = useMuteItem(true); // publish parameter
muteItem(user);

// Old approach for checking if muted
const { mutedPubkeys } = useMuteList();
const isMuted = mutedPubkeys.has(pubkey);
```

#### After:

```javascript
// New approach
const muteItem = useMuteItem({ publish: true }); // options object
muteItem(user);

// New approach for checking if muted
const isUserMuted = useIsItemMuted(user);
```

### 4. New Hooks Available

The refactoring introduces several new hooks:

- `useActiveMuteCriteria`: Get mute criteria for the active user
- `useMuteFilter`: Get a function to check if an event is muted
- `useMuteItem`: Get a function to mute an item
- `useUnmuteItem`: Get a function to unmute an item
- `useIsItemMuted`: Check if an item is muted
- `usePublishMuteList`: Get a function to publish the mute list

### 5. Update Observer Hook Usage

The observer hook now supports mute filtering:

```diff
- const events = useObserver(filters);
+ const events = useObserver(filters, { includeMuted: false }); // false is default
```

### 6. Update MuteCriteria Usage

The `MuteCriteria` type has been updated with simplified property names:

```diff
type MuteCriteria = {
-  mutedPubkeys: Set<Hexpubkey>;
-  mutedEventIds: Set<string>;
-  mutedHashtags: Set<string>;
-  mutedWordsRegex: RegExp | null;
+  pubkeys: Set<Hexpubkey>;
+  eventIds: Set<string>;
+  hashtags: Set<string>;
+  wordsRegex: RegExp | null;
}
```

Update any code that uses these properties:

```diff
- if (muteCriteria.mutedPubkeys.has(pubkey)) {
+ if (muteCriteria.pubkeys.has(pubkey)) {
```

### 7. Update NDKUserMutes Usage

The `NDKUserMutes` type has been updated with simplified property names:

```diff
type NDKUserMutes = {
  pubkey: Hexpubkey;
-  mutedPubkeys: Set<Hexpubkey>;
-  mutedHashtags: Set<string>;
-  mutedWords: Set<string>;
-  mutedEventIds: Set<string>;
+  pubkeys: Set<Hexpubkey>;
+  hashtags: Set<string>;
+  words: Set<string>;
+  eventIds: Set<string>;
  muteListEvent?: NDKEvent;
}
```

## Examples

### Muting a User

```javascript
import { useMuteItem } from "ndk-hooks";
import { NDKUser } from "@nostr-dev-kit/ndk";

function MuteUserButton({ user }: { user: NDKUser }) {
  const muteUser = useMuteItem();
  return <button onClick={() => muteUser(user)}>Mute User</button>;
}
```

### Filtering Muted Events

```javascript
import { useMuteFilter } from "ndk-hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";

function Feed({ events }: { events: NDKEvent[] }) {
  const muteFilter = useMuteFilter();
  const visibleEvents = events.filter(e => !muteFilter(e));
  return (
    <div>
      {visibleEvents.map(e => <div key={e.id}>{e.content}</div>)}
    </div>
  );
}
```

### Checking if an Item is Muted

```javascript
import { useIsItemMuted } from "ndk-hooks";
import { NDKUser } from "@nostr-dev-kit/ndk";

function MutedBadge({ user }: { user: NDKUser }) {
  const isMuted = useIsItemMuted(user);
  return isMuted ? <span>Muted</span> : null;
}
```

## Benefits of the New Architecture

1. **Separation of Concerns**: Muting functionality is now in its own dedicated store
2. **Improved API**: More intuitive and comprehensive API for working with mutes
3. **Better Testability**: Mute functionality can be tested independently
4. **Extensibility**: The dedicated mute store can be extended with additional features
5. **Performance Optimizations**: Dedicated store allows for more focused optimizations
6. **Type Safety**: All hooks and store functions are fully typed with TypeDoc

For more details, see the documentation in `docs/wrappers/react.md` and code examples in `docs/snippets/react`.