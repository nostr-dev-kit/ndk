# Mute Store Implementation Plan

## Overview

This document outlines the plan to move the muting functionality from the session store to a dedicated mute store. This refactoring will improve code organization, separation of concerns, and make the muting functionality more maintainable and extensible.

## Current Implementation

Currently, muting functionality is integrated into the session store:

1. The `NDKUserSession` interface in `ndk-hooks/src/session/store/types.ts` contains mute-related properties:
   - `mutedPubkeys`: A Set of hexadecimal public keys that are muted
   - `mutedHashtags`: A Set of hashtags that are muted
   - `mutedWords`: A Set of words that are muted
   - `mutedEventIds`: A Set of event IDs that are muted

2. The `handleMuteListEvent` function in `ndk-hooks/src/session/store/start-session.ts` processes mute list events (kind 10000) and updates the session's mute lists.

3. The `buildSessionFilter` function includes the mute list kind in the filter if the `muteList` option is not explicitly set to false.

4. Utility functions in `ndk-hooks/src/utils/mute.ts` provide functionality to check if an event is muted.

5. Hooks in `ndk-hooks/src/common/hooks/mute.ts` provide React hooks for working with mutes.

## New Implementation

### 1. Create New Files

We'll create the following new files:

- `ndk-hooks/src/mutes/store/types.ts`: Define types for the mute store
- `ndk-hooks/src/mutes/store/index.ts`: Implement the mute store using Zustand
- `ndk-hooks/src/mutes/hooks/index.ts`: Implement hooks for interacting with the mute store

### 2. Type Definitions

In `ndk-hooks/src/mutes/store/types.ts`, we'll define the following types:

```typescript
import type { NDKEvent, NDKKind, Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Mute criteria used for filtering events
 */
export interface MuteCriteria {
  mutedPubkeys: Set<Hexpubkey>;
  mutedEventIds: Set<string>;
  mutedHashtags: Set<string>; // Lowercase
  mutedWordsRegex: RegExp | null;
}

/**
 * User-specific mute data
 */
export interface NDKUserMutes {
  pubkey: Hexpubkey;
  mutedPubkeys: Set<Hexpubkey>;
  mutedHashtags: Set<string>;
  mutedWords: Set<string>;
  mutedEventIds: Set<string>;
  
  /**
   * The NDKEvent representing the mute list (kind 10000)
   */
  muteListEvent?: NDKEvent;
}

/**
 * Type for items that can be muted
 */
export type MuteableItem = NDKEvent | Hexpubkey | string;

/**
 * Type for the mute item type
 */
export type MuteItemType = "pubkey" | "hashtag" | "word" | "event";

/**
 * Options for publishing mute list events
 */
export interface PublishMuteListOptions {
  /**
   * Whether to publish the mute list event
   * @default true
   */
  publish?: boolean;
}

/**
 * The state structure for the NDK Mutes Zustand store
 */
export interface NDKMutesState {
  /**
   * Map of user mutes by pubkey
   */
  mutes: Map<Hexpubkey, NDKUserMutes>;
  
  /**
   * The active pubkey for mute operations
   */
  activePubkey: Hexpubkey | null;
  
  /**
   * Initialize mutes for a user
   * @param pubkey The pubkey of the user
   */
  initMutes: (pubkey: Hexpubkey) => void;
  
  /**
   * Load mute list for a user from an event
   * @param pubkey The pubkey of the user
   * @param event The mute list event
   */
  loadMuteList: (pubkey: Hexpubkey, event: NDKEvent) => void;
  
  /**
   * Mute an item for a user
   * @param pubkey The pubkey of the user
   * @param item The item to mute
   * @param type The type of the item
   * @param options Options for publishing the mute list
   */
  muteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) => void;
  
  /**
   * Unmute an item for a user
   * @param pubkey The pubkey of the user
   * @param item The item to unmute
   * @param type The type of the item
   * @param options Options for publishing the mute list
   */
  unmuteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) => void;
  
  /**
   * Set the active pubkey for mute operations
   * @param pubkey The pubkey to set as active
   */
  setActivePubkey: (pubkey: Hexpubkey | null) => void;
  
  /**
   * Get mute criteria for a user
   * @param pubkey The pubkey of the user
   */
  getMuteCriteria: (pubkey: Hexpubkey) => MuteCriteria;
  
  /**
   * Check if an item is muted for a user
   * @param pubkey The pubkey of the user
   * @param item The item to check
   * @param type The type of the item
   */
  isItemMuted: (pubkey: Hexpubkey, item: string, type: MuteItemType) => boolean;
  
  /**
   * Publish the mute list for a user
   * @param pubkey The pubkey of the user
   */
  publishMuteList: (pubkey: Hexpubkey) => Promise<NDKEvent | undefined>;
}
```

### 3. Store Implementation

In `ndk-hooks/src/mutes/store/index.ts`, we'll implement the mute store using Zustand:

```typescript
import { enableMapSet } from "immer";
import { type StateCreator, create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Hexpubkey, NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { 
  NDKMutesState, 
  NDKUserMutes, 
  MuteCriteria, 
  MuteItemType,
  PublishMuteListOptions 
} from "./types";
import { useNDKSessions } from "../../session/store";

// Enable Map and Set support for Immer
enableMapSet();

/**
 * Initialize mutes for a user
 */
const initMutes = (
  set: (fn: (draft: NDKMutesState) => void) => void,
  get: () => NDKMutesState,
  pubkey: Hexpubkey
) => {
  set((state) => {
    if (!state.mutes.has(pubkey)) {
      state.mutes.set(pubkey, {
        pubkey,
        mutedPubkeys: new Set<Hexpubkey>(),
        mutedHashtags: new Set<string>(),
        mutedWords: new Set<string>(),
        mutedEventIds: new Set<string>(),
      });
    }
  });
};

/**
 * Load mute list for a user from an event
 */
const loadMuteList = (
  set: (fn: (draft: NDKMutesState) => void) => void,
  get: () => NDKMutesState,
  pubkey: Hexpubkey,
  event: NDKEvent
) => {
  set((state) => {
    // Initialize mutes if they don't exist
    if (!state.mutes.has(pubkey)) {
      initMutes(set, get, pubkey);
    }

    const userMutes = state.mutes.get(pubkey);
    if (!userMutes) return;

    const mutedPubkeys = new Set<Hexpubkey>();
    const mutedEvents = new Set<string>();
    const mutedHashtags = new Set<string>();
    const mutedWords = new Set<string>();

    for (const tag of event.tags) {
      if (tag[0] === "p") mutedPubkeys.add(tag[1]);
      else if (tag[0] === "e") mutedEvents.add(tag[1]);
      else if (tag[0] === "t") mutedHashtags.add(tag[1]);
      else if (tag[0] === "word") mutedWords.add(tag[1]);
    }

    userMutes.mutedPubkeys = mutedPubkeys;
    userMutes.mutedEventIds = mutedEvents;
    userMutes.mutedHashtags = mutedHashtags;
    userMutes.mutedWords = mutedWords;
    userMutes.muteListEvent = event;
  });
};

/**
 * Mute an item for a user
 */
const muteItem = (
  set: (fn: (draft: NDKMutesState) => void) => void,
  get: () => NDKMutesState,
  pubkey: Hexpubkey,
  item: string,
  type: MuteItemType,
  options?: PublishMuteListOptions
) => {
  set((state) => {
    // Initialize mutes if they don't exist
    if (!state.mutes.has(pubkey)) {
      initMutes(set, get, pubkey);
    }

    const userMutes = state.mutes.get(pubkey);
    if (!userMutes) return;

    switch (type) {
      case "pubkey":
        userMutes.mutedPubkeys.add(item);
        break;
      case "event":
        userMutes.mutedEventIds.add(item);
        break;
      case "hashtag":
        userMutes.mutedHashtags.add(item);
        break;
      case "word":
        userMutes.mutedWords.add(item);
        break;
    }
  });

  // Publish the updated mute list if requested
  if (options?.publish !== false) {
    get().publishMuteList(pubkey);
  }
};

/**
 * Unmute an item for a user
 */
const unmuteItem = (
  set: (fn: (draft: NDKMutesState) => void) => void,
  get: () => NDKMutesState,
  pubkey: Hexpubkey,
  item: string,
  type: MuteItemType,
  options?: PublishMuteListOptions
) => {
  set((state) => {
    const userMutes = state.mutes.get(pubkey);
    if (!userMutes) return;

    switch (type) {
      case "pubkey":
        userMutes.mutedPubkeys.delete(item);
        break;
      case "event":
        userMutes.mutedEventIds.delete(item);
        break;
      case "hashtag":
        userMutes.mutedHashtags.delete(item);
        break;
      case "word":
        userMutes.mutedWords.delete(item);
        break;
    }
  });

  // Publish the updated mute list if requested
  if (options?.publish !== false) {
    get().publishMuteList(pubkey);
  }
};

/**
 * Set the active pubkey for mute operations
 */
const setActivePubkey = (
  set: (fn: (draft: NDKMutesState) => void) => void,
  pubkey: Hexpubkey | null
) => {
  set((state) => {
    state.activePubkey = pubkey;
  });
};

/**
 * Get mute criteria for a user
 */
const getMuteCriteria = (
  get: () => NDKMutesState,
  pubkey: Hexpubkey
): MuteCriteria => {
  const userMutes = get().mutes.get(pubkey);
  
  if (!userMutes) {
    return {
      mutedPubkeys: new Set<Hexpubkey>(),
      mutedEventIds: new Set<string>(),
      mutedHashtags: new Set<string>(),
      mutedWordsRegex: null,
    };
  }

  const words = userMutes.mutedWords;
  const wordsRegex = words.size > 0 ? new RegExp(Array.from(words).join("|"), "i") : null;

  const lowerCaseHashtags = new Set<string>();
  for (const h of userMutes.mutedHashtags) {
    lowerCaseHashtags.add(h.toLowerCase());
  }

  return {
    mutedPubkeys: userMutes.mutedPubkeys,
    mutedEventIds: userMutes.mutedEventIds,
    mutedHashtags: lowerCaseHashtags,
    mutedWordsRegex: wordsRegex,
  };
};

/**
 * Check if an item is muted for a user
 */
const isItemMuted = (
  get: () => NDKMutesState,
  pubkey: Hexpubkey,
  item: string,
  type: MuteItemType
): boolean => {
  const userMutes = get().mutes.get(pubkey);
  if (!userMutes) return false;

  switch (type) {
    case "pubkey":
      return userMutes.mutedPubkeys.has(item);
    case "event":
      return userMutes.mutedEventIds.has(item);
    case "hashtag":
      return userMutes.mutedHashtags.has(item.toLowerCase());
    case "word":
      const wordsRegex = userMutes.mutedWords.size > 0 
        ? new RegExp(Array.from(userMutes.mutedWords).join("|"), "i") 
        : null;
      return wordsRegex ? wordsRegex.test(item) : false;
    default:
      return false;
  }
};

/**
 * Publish the mute list for a user
 */
const publishMuteList = async (
  get: () => NDKMutesState,
  pubkey: Hexpubkey
): Promise<NDKEvent | undefined> => {
  const userMutes = get().mutes.get(pubkey);
  if (!userMutes) return undefined;

  // Get NDK instance from session store
  const ndk = useNDKSessions.getState().ndk;
  if (!ndk) return undefined;

  // Create a new mute list event
  const event = new ndk.NDKEvent(ndk);
  event.kind = 10000;
  event.content = "";

  // Add tags for muted items
  for (const mutedPubkey of userMutes.mutedPubkeys) {
    event.tags.push(["p", mutedPubkey]);
  }

  for (const mutedEventId of userMutes.mutedEventIds) {
    event.tags.push(["e", mutedEventId]);
  }

  for (const mutedHashtag of userMutes.mutedHashtags) {
    event.tags.push(["t", mutedHashtag]);
  }

  for (const mutedWord of userMutes.mutedWords) {
    event.tags.push(["word", mutedWord]);
  }

  try {
    // Sign and publish the event
    await event.sign();
    await event.publish();
    
    // Update the mute list event in the store
    get().loadMuteList(pubkey, event);
    
    return event;
  } catch (error) {
    console.error("Failed to publish mute list:", error);
    return undefined;
  }
};

/**
 * Create the mute store
 */
const mutesStateCreator: StateCreator<NDKMutesState, [["zustand/immer", never]]> = (set, get) => ({
  mutes: new Map<Hexpubkey, NDKUserMutes>(),
  activePubkey: null,
  
  initMutes: (pubkey: Hexpubkey) => initMutes(set, get, pubkey),
  loadMuteList: (pubkey: Hexpubkey, event: NDKEvent) => loadMuteList(set, get, pubkey, event),
  muteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) => 
    muteItem(set, get, pubkey, item, type, options),
  unmuteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) => 
    unmuteItem(set, get, pubkey, item, type, options),
  setActivePubkey: (pubkey: Hexpubkey | null) => setActivePubkey(set, pubkey),
  getMuteCriteria: (pubkey: Hexpubkey) => getMuteCriteria(get, pubkey),
  isItemMuted: (pubkey: Hexpubkey, item: string, type: MuteItemType) => 
    isItemMuted(get, pubkey, item, type),
  publishMuteList: (pubkey: Hexpubkey) => publishMuteList(get, pubkey),
});

// Create the store using the Immer middleware
export const useNDKMutes = create(immer(mutesStateCreator));

// Export the state type
export type { NDKMutesState };
```

### 4. Hooks Implementation

In `ndk-hooks/src/mutes/hooks/index.ts`, we'll implement hooks for interacting with the mute store:

```typescript
import { useCallback, useMemo } from "react";
import type { NDKEvent, NDKUser, Hexpubkey } from "@nostr-dev-kit/ndk";
import { useNDKMutes } from "../store";
import { useNDKSessions } from "../../session/store";
import { useNDKCurrentUser } from "../../ndk/hooks";
import type { MuteCriteria, MuteItemType, PublishMuteListOptions } from "../store/types";
import { isMuted } from "../../utils/mute";

/**
 * Type definition for the item that can be muted.
 */
type MutableItem = NDKEvent | NDKUser | string;

/**
 * Hook to get the mute criteria for the active user
 * @returns The mute criteria for the active user
 */
export function useActiveMuteCriteria(): MuteCriteria {
  const activePubkey = useNDKSessions((s) => s.activePubkey);
  return useNDKMutes((s) => 
    activePubkey ? s.getMuteCriteria(activePubkey) : {
      mutedPubkeys: new Set<Hexpubkey>(),
      mutedEventIds: new Set<string>(),
      mutedHashtags: new Set<string>(),
      mutedWordsRegex: null,
    }
  );
}

/**
 * Hook to get a function that checks if an event is muted
 * @returns A function that returns true if the event is muted
 */
export function useMuteFilter(): (event: NDKEvent) => boolean {
  const muteCriteria = useActiveMuteCriteria();

  const filterFn = useCallback(
    (event: NDKEvent): boolean => {
      return isMuted(event, muteCriteria);
    },
    [muteCriteria],
  );

  return filterFn;
}

/**
 * Hook to get a function that mutes an item
 * @param options Options for publishing the mute list
 * @returns A function that mutes an item
 */
export function useMuteItem(options?: PublishMuteListOptions): (item: MutableItem) => void {
  const currentUser = useNDKCurrentUser();
  const muteItem = useNDKMutes((s) => s.muteItem);

  const muteFn = useCallback(
    (item: MutableItem) => {
      if (!currentUser?.pubkey) {
        console.warn("useMuteItem: No active user found. Cannot mute item.");
        return;
      }

      let itemType: MuteItemType;
      let value: string;

      if (item instanceof NDKEvent) {
        itemType = "event";
        value = item.id;
      } else if (item instanceof NDKUser) {
        itemType = "pubkey";
        value = item.pubkey;
      } else if (typeof item === "string") {
        if (item.startsWith("#") && item.length > 1) {
          itemType = "hashtag";
          value = item.substring(1);
        } else {
          itemType = "word";
          value = item;
        }
      } else {
        console.warn("useMuteItem: Invalid item type provided.", item);
        return;
      }

      muteItem(currentUser.pubkey, value, itemType, options);
    },
    [currentUser?.pubkey, muteItem, options],
  );

  return muteFn;
}

/**
 * Hook to get a function that unmutes an item
 * @param options Options for publishing the mute list
 * @returns A function that unmutes an item
 */
export function useUnmuteItem(options?: PublishMuteListOptions): (item: MutableItem) => void {
  const currentUser = useNDKCurrentUser();
  const unmuteItem = useNDKMutes((s) => s.unmuteItem);

  const unmuteFn = useCallback(
    (item: MutableItem) => {
      if (!currentUser?.pubkey) {
        console.warn("useUnmuteItem: No active user found. Cannot unmute item.");
        return;
      }

      let itemType: MuteItemType;
      let value: string;

      if (item instanceof NDKEvent) {
        itemType = "event";
        value = item.id;
      } else if (item instanceof NDKUser) {
        itemType = "pubkey";
        value = item.pubkey;
      } else if (typeof item === "string") {
        if (item.startsWith("#") && item.length > 1) {
          itemType = "hashtag";
          value = item.substring(1);
        } else {
          itemType = "word";
          value = item;
        }
      } else {
        console.warn("useUnmuteItem: Invalid item type provided.", item);
        return;
      }

      unmuteItem(currentUser.pubkey, value, itemType, options);
    },
    [currentUser?.pubkey, unmuteItem, options],
  );

  return unmuteFn;
}

/**
 * Hook to check if an item is muted
 * @param item The item to check
 * @returns True if the item is muted
 */
export function useIsItemMuted(item: MutableItem): boolean {
  const currentUser = useNDKCurrentUser();
  const isItemMuted = useNDKMutes((s) => s.isItemMuted);

  return useMemo(() => {
    if (!currentUser?.pubkey) return false;

    let itemType: MuteItemType;
    let value: string;

    if (item instanceof NDKEvent) {
      itemType = "event";
      value = item.id;
    } else if (item instanceof NDKUser) {
      itemType = "pubkey";
      value = item.pubkey;
    } else if (typeof item === "string") {
      if (item.startsWith("#") && item.length > 1) {
        itemType = "hashtag";
        value = item.substring(1);
      } else {
        itemType = "word";
        value = item;
      }
    } else {
      return false;
    }

    return isItemMuted(currentUser.pubkey, value, itemType);
  }, [currentUser?.pubkey, isItemMuted, item]);
}

/**
 * Hook to publish the mute list for the active user
 * @returns A function that publishes the mute list
 */
export function usePublishMuteList(): () => Promise<NDKEvent | undefined> {
  const currentUser = useNDKCurrentUser();
  const publishMuteList = useNDKMutes((s) => s.publishMuteList);

  return useCallback(async () => {
    if (!currentUser?.pubkey) {
      console.warn("usePublishMuteList: No active user found. Cannot publish mute list.");
      return undefined;
    }

    return publishMuteList(currentUser.pubkey);
  }, [currentUser?.pubkey, publishMuteList]);
}
```

### 5. Update Session Store

We need to update the session store to remove muting functionality and integrate with the new mute store:

1. Update `ndk-hooks/src/session/store/types.ts`:
   - Remove mute-related properties from `NDKUserSession`
   - Remove `muteList` option from `SessionStartOptions`

2. Update `ndk-hooks/src/session/store/start-session.ts`:
   - Remove `handleMuteListEvent` function
   - Update `processEvent` to use the mute store for mute list events
   - Update `buildSessionFilter` to remove mute list kind

### 6. Update Existing Mute Hooks

Update `ndk-hooks/src/common/hooks/mute.ts` to use the new mute store:

```typescript
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useCallback } from "react";
import { useMuteFilter as useNewMuteFilter, useMuteItem as useNewMuteItem } from "../../mutes/hooks";

/**
 * @deprecated Use useMuteFilter from "../../mutes/hooks" instead
 */
export function useMuteFilter(): (event: NDKEvent) => boolean {
  return useNewMuteFilter();
}

/**
 * Type definition for the item that can be muted.
 */
type MutableItem = NDKEvent | NDKUser | string;

/**
 * @deprecated Use useMuteItem from "../../mutes/hooks" instead
 */
export function useMuteItem(publish = true): (item: MutableItem) => void {
  const muteItem = useNewMuteItem({ publish });
  
  return useCallback(
    (item: MutableItem) => {
      muteItem(item);
    },
    [muteItem],
  );
}
```

## Migration Strategy

1. Implement the new mute store and hooks
2. Update the session store to use the new mute store for mute list events
3. Update existing code that uses the session store's mute functionality to use the new mute store
4. Add deprecation warnings to the old mute hooks
5. Eventually remove the deprecated hooks and mute-related code from the session store

## Store Interactions and Usage Examples

### Session Store and Mute Store Interaction

The session store and mute store will interact in the following ways:

1. **Initialization**: When a user session is initialized, the mute store will also be initialized for that user.
2. **Active User Synchronization**: When the active user changes in the session store, the mute store's active user will also be updated.
3. **Mute List Events**: When a mute list event is received in the session store, it will be delegated to the mute store.

Here's an example of how the session store will be updated to delegate mute list handling to the mute store:

```typescript
// In ndk-hooks/src/session/store/start-session.ts

import { useNDKMutes } from "../../mutes/store";

// Update the processEvent function to delegate mute list events to the mute store
function processEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>, opts?: SessionStartOptions): void {
  // ...existing code...
  
  try {
    switch (event.kind) {
      case NDKKind.Metadata:
        handleProfileEvent(event, sessionDraft);
        break;
      case NDKKind.Contacts:
        handleContactsEvent(event, sessionDraft);
        break;
      case NDKKind.MuteList:
        // Delegate to mute store instead of handling in session store
        useNDKMutes.getState().loadMuteList(sessionDraft.pubkey, event);
        break;
      // ...other cases...
    }
    
    // ...existing code...
  } catch (error) {
    console.error(`Error processing event kind ${event.kind} for ${sessionDraft.pubkey}:`, error, event);
  }
}
```

And here's how the session store will sync the active user with the mute store:

```typescript
// In ndk-hooks/src/session/store/switch-to-user.ts

import { useNDKMutes } from "../../mutes/store";

export const switchToUser = (
  set: (fn: (draft: NDKSessionsState) => void) => void,
  get: () => NDKSessionsState,
  pubkey: Hexpubkey | null,
): void => {
  // ...existing code...
  
  // Update the active pubkey in the session store
  set((draft) => {
    draft.activePubkey = pubkey;
  });
  
  // Sync with mute store
  useNDKMutes.getState().setActivePubkey(pubkey);
  
  // ...existing code...
};
```

### User Interaction Examples

Here are examples of how users would interact with the mute functionality through the provided hooks:

#### 1. Muting a User

```tsx
import { useMuteItem } from "ndk-hooks/src/mutes/hooks";
import { NDKUser } from "@nostr-dev-kit/ndk";

function UserProfile({ user }: { user: NDKUser }) {
  const muteUser = useMuteItem();
  
  const handleMuteClick = () => {
    muteUser(user);
  };
  
  return (
    <div>
      <h2>{user.profile?.name || user.pubkey.slice(0, 8)}</h2>
      <button onClick={handleMuteClick}>Mute User</button>
    </div>
  );
}
```

#### 2. Checking if a User is Muted

```tsx
import { useIsItemMuted } from "ndk-hooks/src/mutes/hooks";
import { NDKUser } from "@nostr-dev-kit/ndk";

function UserListItem({ user }: { user: NDKUser }) {
  const isMuted = useIsItemMuted(user);
  
  return (
    <div className={isMuted ? "muted-user" : ""}>
      <span>{user.profile?.name || user.pubkey.slice(0, 8)}</span>
      {isMuted && <span className="muted-badge">Muted</span>}
    </div>
  );
}
```

#### 3. Filtering Muted Events in a Feed

```tsx
import { useMuteFilter } from "ndk-hooks/src/mutes/hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useState, useEffect } from "react";

function EventFeed({ events }: { events: NDKEvent[] }) {
  const muteFilter = useMuteFilter();
  const [filteredEvents, setFilteredEvents] = useState<NDKEvent[]>([]);
  
  useEffect(() => {
    // Filter out muted events
    const nonMutedEvents = events.filter(event => !muteFilter(event));
    setFilteredEvents(nonMutedEvents);
  }, [events, muteFilter]);
  
  return (
    <div>
      {filteredEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

#### 4. Muting a Hashtag

```tsx
import { useMuteItem } from "ndk-hooks/src/mutes/hooks";

function HashtagComponent({ tag }: { tag: string }) {
  const muteHashtag = useMuteItem();
  
  const handleMuteClick = () => {
    // The # prefix indicates it's a hashtag
    muteHashtag(`#${tag}`);
  };
  
  return (
    <div>
      <span>#{tag}</span>
      <button onClick={handleMuteClick}>Mute Hashtag</button>
    </div>
  );
}
```

#### 5. Managing Mute Settings in a User Interface

```tsx
import {
  useNDKMutes,
  useActiveMuteCriteria,
  useUnmuteItem
} from "ndk-hooks/src/mutes/hooks";
import { useNDKCurrentUser } from "ndk-hooks/src/ndk/hooks";
import { NDKUser } from "@nostr-dev-kit/ndk";

function MuteSettings() {
  const currentUser = useNDKCurrentUser();
  const muteCriteria = useActiveMuteCriteria();
  const unmuteItem = useUnmuteItem();
  
  if (!currentUser) return <div>Please log in to manage mute settings</div>;
  
  return (
    <div>
      <h2>Mute Settings</h2>
      
      <h3>Muted Users</h3>
      <ul>
        {Array.from(muteCriteria.mutedPubkeys).map(pubkey => (
          <li key={pubkey}>
            {pubkey.slice(0, 8)}...
            <button onClick={() => unmuteItem(new NDKUser({ pubkey }))}>
              Unmute
            </button>
          </li>
        ))}
      </ul>
      
      <h3>Muted Hashtags</h3>
      <ul>
        {Array.from(muteCriteria.mutedHashtags).map(hashtag => (
          <li key={hashtag}>
            #{hashtag}
            <button onClick={() => unmuteItem(`#${hashtag}`)}>
              Unmute
            </button>
          </li>
        ))}
      </ul>
      
      <h3>Muted Words</h3>
      <ul>
        {Array.from(muteCriteria.mutedWordsRegex?.source.split('|') || []).map(word => (
          <li key={word}>
            {word}
            <button onClick={() => unmuteItem(word)}>
              Unmute
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Integration with useSubscribe

The `useSubscribe` hook is a key component that users of ndk-hooks use to get data. It currently applies muting settings of the active user by default. We need to update it to work with the new mute store while maintaining performance.

### Current Implementation

Currently, the `useSubscribe` hook uses the `useMuteFilter` hook from `common/hooks/mute.ts`, which gets the mute settings from the session store:

```typescript
// In ndk-hooks/src/subscribe/hooks/index.ts
import { useMuteFilter } from "../../common/hooks/mute";

export function useSubscribe<T extends NDKEvent, R = T[]>(
    filters: NDKFilter[] | false,
    opts: UseSubscribeOptions = {},
    dependencies: unknown[] = [],
): { events: T[]; eose: boolean } {
    // ...
    const muteFilter = useMuteFilter();
    
    // ...
    
    // Filter events when they arrive
    const handleEvent = (event: NDKEvent) => {
        // ...
        if (!opts.includeMuted && muteFilter(event)) {
            return;
        }
        // ...
    };
    
    // Filter cached events
    const handleCachedEvents = (events: NDKEvent[]) => {
        if (events && events.length > 0) {
            const validEvents = events.filter((e: NDKEvent) => {
                // ...
                if (!opts.includeMuted && muteFilter(e)) return false;
                // ...
            });
            // ...
        }
    };
    
    // ...
    
    // Re-filter events when mute settings change
    useEffect(() => {
        if (!opts.includeMuted) {
            const state = store.getState();
            state.filterMutedEvents(muteFilter);
        }
    }, [muteFilter, store, opts.includeMuted]);
    
    // ...
}
```

### Updated Implementation

Since we're moving the muting functionality to a dedicated store, we need to update the `useSubscribe` hook to use the new mute store. The changes will be minimal since we're maintaining backward compatibility through the deprecated hooks:

```typescript
// No changes needed to useSubscribe itself!
// It will continue to use useMuteFilter, which will now be a wrapper around the new implementation
```

The beauty of our approach is that the `useSubscribe` hook doesn't need to change at all. The `useMuteFilter` hook it depends on will be updated to use the new mute store internally, providing a seamless transition.

### Performance Considerations

Performance is critical for the mute filtering functionality, especially since it's applied to every event in a subscription. Here are the performance optimizations we'll implement:

1. **Memoized Mute Criteria**: The `useActiveMuteCriteria` hook will use `useMemo` to avoid unnecessary recalculations of the mute criteria.

2. **Efficient Regex Creation**: We'll only create the regex for muted words when needed and cache it to avoid repeated regex compilation.

3. **Set-based Lookups**: We'll continue to use Sets for muted pubkeys, event IDs, and hashtags to ensure O(1) lookup performance.

4. **Selective Updates**: The mute store will only trigger updates when the mute lists actually change, not on every interaction.

5. **Optimized isMuted Function**: We'll optimize the `isMuted` function to check the most common mute criteria first (like pubkey) before performing more expensive checks.

Here's an optimized version of the `isMuted` function:

```typescript
// In ndk-hooks/src/utils/mute.ts
export const isMuted = (event: NDKEvent, criteria: MuteCriteria): boolean => {
    const { mutedPubkeys, mutedEventIds, mutedHashtags, mutedWordsRegex } = criteria;
    
    // Check pubkey first (most common and fastest check)
    if (mutedPubkeys.has(event.pubkey)) return true;
    
    // Check event ID
    if (mutedEventIds.has(event.id)) return true;
    
    // Check tagged events (less common)
    const taggedEvents = event.getMatchingTags("e").map((tag) => tag[1]);
    for (const taggedEvent of taggedEvents) {
        if (mutedEventIds.has(taggedEvent)) return true;
    }
    
    // Check hashtags (less common)
    if (mutedHashtags.size > 0) {
        const tags = event.getMatchingTags("t").map((tag) => tag[1].toLowerCase());
        for (const tag of tags) {
            if (mutedHashtags.has(tag)) return true;
        }
    }
    
    // Check content with regex (most expensive, do last)
    if (mutedWordsRegex && event.content) {
        if (event.content.match(mutedWordsRegex)) return true;
    }
    
    return false;
};
```

### Usage Examples with useSubscribe

Here are examples of how users would use the mute store with `useSubscribe`:

#### 1. Basic Usage (No Changes Required)

Users can continue to use `useSubscribe` exactly as before, and it will automatically apply the mute filter:

```tsx
import { useSubscribe } from "ndk-hooks/src/subscribe/hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";

function EventFeed() {
  const { events, eose } = useSubscribe<NDKEvent>(
    [{ kinds: [1], limit: 100 }]
  );
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      {!eose && <LoadingIndicator />}
    </div>
  );
}
```

#### 2. Including Muted Events

If users want to include muted events, they can set the `includeMuted` option to `true`:

```tsx
import { useSubscribe } from "ndk-hooks/src/subscribe/hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";

function AllEventsFeed() {
  const { events, eose } = useSubscribe<NDKEvent>(
    [{ kinds: [1], limit: 100 }],
    { includeMuted: true }
  );
  
  return (
    <div>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
        />
      ))}
      {!eose && <LoadingIndicator />}
    </div>
  );
}
```

#### 3. Custom Mute Filtering

For advanced use cases, users can implement custom mute filtering by combining `useSubscribe` with the mute store hooks:

```tsx
import { useSubscribe } from "ndk-hooks/src/subscribe/hooks";
import { useActiveMuteCriteria } from "ndk-hooks/src/mutes/hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useState, useEffect } from "react";

function CustomFilteredFeed() {
  // Get all events including muted ones
  const { events: allEvents, eose } = useSubscribe<NDKEvent>(
    [{ kinds: [1], limit: 100 }],
    { includeMuted: true }
  );
  
  const muteCriteria = useActiveMuteCriteria();
  const [filteredEvents, setFilteredEvents] = useState<NDKEvent[]>([]);
  
  // Apply custom filtering
  useEffect(() => {
    // Only filter out muted pubkeys, but allow muted hashtags and words
    const filtered = allEvents.filter(event => !muteCriteria.mutedPubkeys.has(event.pubkey));
    setFilteredEvents(filtered);
  }, [allEvents, muteCriteria]);
  
  return (
    <div>
      {filteredEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      {!eose && <LoadingIndicator />}
    </div>
  );
}
```

#### 4. Muting Items from a Feed

Users can combine `useSubscribe` with muting functionality to allow muting items directly from a feed. The feed will automatically update to remove muted content without any additional code:

```tsx
import { useSubscribe } from "ndk-hooks/src/subscribe/hooks";
import { useMuteItem } from "ndk-hooks/src/mutes/hooks";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

function InteractiveFeed() {
  // Standard useSubscribe hook - automatically filters out muted content
  const { events, eose } = useSubscribe<NDKEvent>(
    [{ kinds: [1], limit: 100 }]
  );
  
  const muteItem = useMuteItem();
  
  const handleMuteUser = (event: NDKEvent) => {
    const user = new NDKUser({ pubkey: event.pubkey });
    muteItem(user);
    // No need to manually filter the feed!
    // The useSubscribe hook will automatically re-filter events when the mute list changes
    // All events from this user will disappear from the feed immediately
  };
  
  const handleMuteEvent = (event: NDKEvent) => {
    muteItem(event);
    // Similarly, this specific event will be removed from the feed automatically
  };
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id} className="event-card">
          <div className="event-content">{event.content}</div>
          <div className="event-actions">
            <button onClick={() => handleMuteUser(event)}>Mute User</button>
            <button onClick={() => handleMuteEvent(event)}>Mute Event</button>
          </div>
        </div>
      ))}
      {!eose && <LoadingIndicator />}
    </div>
  );
}
```

This automatic updating works because:

1. When a user or event is muted, the mute store is updated
2. This triggers an update to the mute criteria
3. The `useMuteFilter` hook returns a new filter function
4. The `useSubscribe` hook has a dependency on the mute filter
5. When the mute filter changes, `useSubscribe` re-filters the events in its store
6. The filtered events are automatically reflected in the component

This seamless integration means developers don't need to write any additional code to handle the removal of muted content from their feeds.

## Benefits

1. **Separation of Concerns**: Muting functionality will be in its own dedicated store, making the code more modular and easier to maintain.
2. **Improved API**: The new mute store provides a more comprehensive API for working with mutes.
3. **Better Testability**: The mute functionality can be tested independently of the session store.
4. **Extensibility**: The new mute store can be extended with additional features without affecting the session store.
5. **Performance Optimizations**: The dedicated mute store allows for more focused performance optimizations.
6. **Seamless Integration**: Existing code using `useSubscribe` will continue to work without changes.

## Step-by-Step Implementation Plan

Following Test-Driven Development (TDD) principles, we'll implement the mute store in small, testable increments. This plan avoids mocking entire modules and classes, focusing instead on targeted testing of specific functionality.

### Phase 1: Test Structure Setup

1. **Create Test Files**
   - Create `ndk-hooks/src/mutes/store/__tests__/mute-store.test.ts`
   - Create `ndk-hooks/src/mutes/hooks/__tests__/mute-hooks.test.ts`
   - Create `ndk-hooks/src/utils/__tests__/mute.test.ts`

2. **Setup Test Utilities**
   - Create test fixtures for NDKEvent, NDKUser, and other required objects
   - Create helper functions for common test operations
   - Example:
     ```typescript
     // ndk-hooks/src/mutes/store/__tests__/fixtures.ts
     import { NDKEvent } from "@nostr-dev-kit/ndk";
     
     export const createMockEvent = (options: {
       id?: string;
       pubkey?: string;
       content?: string;
       tags?: string[][];
     }) => {
       const event = new NDKEvent() as any;
       event.id = options.id || "test-event-id";
       event.pubkey = options.pubkey || "test-pubkey";
       event.content = options.content || "test content";
       event.tags = options.tags || [];
       event.getMatchingTags = (tagName: string) =>
         event.tags.filter(tag => tag[0] === tagName);
       return event as NDKEvent;
     };
     ```

3. **Write Initial Tests for Utils**
   - Test the `isMuted` function with various scenarios
   - Test the `setHasAnyIntersection` utility function
   - Example:
     ```typescript
     // ndk-hooks/src/utils/__tests__/mute.test.ts
     import { isMuted, setHasAnyIntersection } from "../mute";
     import { createMockEvent } from "../../mutes/store/__tests__/fixtures";
     
     describe("setHasAnyIntersection", () => {
       it("returns false for empty sets", () => {
         const set1 = new Set<string>();
         const set2 = new Set<string>(["a", "b"]);
         expect(setHasAnyIntersection(set1, set2)).toBe(false);
         expect(setHasAnyIntersection(set2, set1)).toBe(false);
       });
       
       it("returns true when sets have common elements", () => {
         const set1 = new Set<string>(["a", "b"]);
         const set2 = new Set<string>(["b", "c"]);
         expect(setHasAnyIntersection(set1, set2)).toBe(true);
       });
     });
     
     describe("isMuted", () => {
       it("returns true when event pubkey is muted", () => {
         const event = createMockEvent({ pubkey: "muted-pubkey" });
         const criteria = {
           mutedPubkeys: new Set(["muted-pubkey"]),
           mutedEventIds: new Set(),
           mutedHashtags: new Set(),
           mutedWordsRegex: null,
         };
         expect(isMuted(event, criteria)).toBe(true);
       });
       
       // Add more test cases for other mute criteria
     });
     ```

### Phase 2: Implement Core Functionality

1. **Implement Types (TDD)**
   - Write tests for type validation
   - Implement the types in `ndk-hooks/src/mutes/store/types.ts`

2. **Implement Mute Store (TDD)**
   - Write tests for store initialization
   - Write tests for each store function (initMutes, loadMuteList, etc.)
   - Implement the store in `ndk-hooks/src/mutes/store/index.ts`
   - Example test:
     ```typescript
     // ndk-hooks/src/mutes/store/__tests__/mute-store.test.ts
     import { useNDKMutes } from "../index";
     import { createMockEvent } from "./fixtures";
     
     describe("useNDKMutes", () => {
       beforeEach(() => {
         // Reset the store before each test
         const store = useNDKMutes.getState();
         store.mutes.clear();
         store.setActivePubkey(null);
       });
       
       describe("initMutes", () => {
         it("initializes mutes for a user", () => {
           const store = useNDKMutes.getState();
           const pubkey = "test-pubkey";
           
           store.initMutes(pubkey);
           
           const userMutes = store.mutes.get(pubkey);
           expect(userMutes).toBeDefined();
           expect(userMutes?.pubkey).toBe(pubkey);
           expect(userMutes?.mutedPubkeys.size).toBe(0);
           expect(userMutes?.mutedHashtags.size).toBe(0);
           expect(userMutes?.mutedWords.size).toBe(0);
           expect(userMutes?.mutedEventIds.size).toBe(0);
         });
       });
       
       // Add more tests for other store functions
     });
     ```

3. **Implement Hooks (TDD)**
   - Write tests for each hook
   - Implement the hooks in `ndk-hooks/src/mutes/hooks/index.ts`
   - Example test:
     ```typescript
     // ndk-hooks/src/mutes/hooks/__tests__/mute-hooks.test.ts
     import { renderHook, act } from "@testing-library/react-hooks";
     import { useNDKMutes } from "../../store";
     import { useMuteItem, useUnmuteItem } from "../index";
     import { NDKUser } from "@nostr-dev-kit/ndk";
     import { createMockEvent } from "../../store/__tests__/fixtures";
     
     // Mock the useNDKCurrentUser hook
     jest.mock("../../../ndk/hooks", () => ({
       useNDKCurrentUser: () => ({ pubkey: "current-user" }),
     }));
     
     describe("useMuteItem", () => {
       beforeEach(() => {
         // Reset the store before each test
         const store = useNDKMutes.getState();
         store.mutes.clear();
         store.initMutes("current-user");
         store.setActivePubkey("current-user");
       });
       
       it("mutes a user", () => {
         const { result } = renderHook(() => useMuteItem({ publish: false }));
         const user = new NDKUser({ pubkey: "user-to-mute" });
         
         act(() => {
           result.current(user);
         });
         
         const store = useNDKMutes.getState();
         const userMutes = store.mutes.get("current-user");
         expect(userMutes?.mutedPubkeys.has("user-to-mute")).toBe(true);
       });
       
       // Add more tests for other hook functions
     });
     ```

### Phase 3: Integration with Session Store

1. **Update Session Store (TDD)**
   - Write tests for the updated session store
   - Remove mute-related properties from `NDKUserSession`
   - Update `processEvent` to delegate mute list events to the mute store
   - Example test:
     ```typescript
     // ndk-hooks/src/session/store/__tests__/start-session.test.ts
     import { useNDKSessions } from "../index";
     import { useNDKMutes } from "../../../mutes/store";
     import { createMockEvent } from "../../../mutes/store/__tests__/fixtures";
     
     describe("processEvent", () => {
       it("delegates mute list events to the mute store", () => {
         // Setup
         const mockNDK = { /* mock NDK instance */ };
         useNDKSessions.getState().init(mockNDK as any);
         
         const sessionPubkey = "test-pubkey";
         useNDKSessions.getState().addSession({ pubkey: sessionPubkey } as any, true);
         
         // Create a spy on the mute store's loadMuteList function
         const loadMuteListSpy = jest.spyOn(useNDKMutes.getState(), "loadMuteList");
         
         // Create a mock mute list event
         const muteListEvent = createMockEvent({
           kind: 10000,
           pubkey: sessionPubkey,
           tags: [["p", "muted-pubkey"]],
         });
         
         // Process the event
         // Note: We need to call the internal processEvent function directly
         // This is a limitation of testing Zustand stores
         const processEvent = require("../start-session").processEvent;
         const sessionDraft = useNDKSessions.getState().sessions.get(sessionPubkey);
         processEvent(muteListEvent, sessionDraft, {});
         
         // Verify the mute store's loadMuteList was called
         expect(loadMuteListSpy).toHaveBeenCalledWith(sessionPubkey, muteListEvent);
       });
     });
     ```

2. **Update Existing Mute Hooks (TDD)**
   - Write tests for the updated mute hooks
   - Update the hooks to use the new mute store

### Phase 4: Integration with useSubscribe

1. **Test Integration with useSubscribe**
   - Write tests to verify that useSubscribe works with the new mute store
   - Example test:
     ```typescript
     // ndk-hooks/src/subscribe/hooks/__tests__/index.test.ts
     import { renderHook, act } from "@testing-library/react-hooks";
     import { useSubscribe } from "../index";
     import { useNDKMutes } from "../../../mutes/store";
     import { createMockEvent } from "../../../mutes/store/__tests__/fixtures";
     
     // Mock the useNDK hook
     jest.mock("../../../ndk/hooks", () => ({
       useNDK: () => ({ ndk: { /* mock NDK instance */ } }),
     }));
     
     describe("useSubscribe with mute integration", () => {
       beforeEach(() => {
         // Reset the mute store
         const store = useNDKMutes.getState();
         store.mutes.clear();
         store.initMutes("current-user");
         store.setActivePubkey("current-user");
       });
       
       it("filters out muted events", () => {
         // Setup: Mute a user
         useNDKMutes.getState().muteItem("current-user", "muted-pubkey", "pubkey", { publish: false });
         
         // Create mock events
         const normalEvent = createMockEvent({ pubkey: "normal-pubkey" });
         const mutedEvent = createMockEvent({ pubkey: "muted-pubkey" });
         
         // Render the hook
         const { result } = renderHook(() => useSubscribe([{ kinds: [1] }]));
         
         // Simulate receiving events
         act(() => {
           // This is a simplification - in reality, we'd need to mock the NDK subscription
           // and trigger the onEvent callback
           const handleEvent = /* get the handleEvent function from the hook */;
           handleEvent(normalEvent);
           handleEvent(mutedEvent);
         });
         
         // Verify only the non-muted event is in the result
         expect(result.current.events).toHaveLength(1);
         expect(result.current.events[0].pubkey).toBe("normal-pubkey");
       });
     });
     ```

2. **Optimize Performance**
   - Write benchmarks for the mute filtering
   - Implement optimizations based on benchmark results

### Phase 5: Final Integration and Testing

1. **End-to-End Testing**
   - Write tests that verify the entire flow from muting an item to seeing it filtered in useSubscribe
   - Test with various mute criteria (pubkeys, hashtags, words, event IDs)

2. **Performance Testing**
   - Test with large datasets to ensure performance is maintained
   - Optimize any bottlenecks discovered

3. **Documentation**
   - Update documentation with usage examples
   - Add migration guide for users of the old API

### Current Status

- [ ] Phase 1: Test Structure Setup
  - [ ] Create test files
  - [ ] Setup test utilities
  - [ ] Write initial tests for utils

- [ ] Phase 2: Implement Core Functionality
  - [ ] Implement types (TDD)
  - [ ] Implement mute store (TDD)
  - [ ] Implement hooks (TDD)

- [ ] Phase 3: Integration with Session Store
  - [ ] Update session store (TDD)
  - [ ] Update existing mute hooks (TDD)

- [ ] Phase 4: Integration with useSubscribe
  - [ ] Test integration with useSubscribe
  - [ ] Optimize performance

- [ ] Phase 5: Final Integration and Testing
  - [ ] End-to-end testing
  - [ ] Performance testing
  - [ ] Documentation